import { QdrantClient } from '@qdrant/js-client-rest';
import { v4 as uuidv4 } from 'uuid';

// Global Qdrant client
let qdrantClient = null;
const COLLECTION_NAME = 'diabetes_docs';

/**
 * Initialize Qdrant client and collection
 */
export const initializeQdrantDB = async () => {
    try {
        if (qdrantClient) return qdrantClient;

        const url = process.env.QDRANT_URL || 'https://ea18a768-ea16-437c-b57e-549184c40279.eu-west-2-0.aws.cloud.qdrant.io';
        const apiKey = process.env.QDRANT_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.OPtgcYpGa403FeI6MQNGal_D-n1NBVHDYkeCQ-cozC4';

        console.log(`Initializing Qdrant Cloud client (url=${url})...`);
        
        qdrantClient = new QdrantClient({
            url: url,
            apiKey: apiKey,
        });

        // Check if collection exists
        const collections = await qdrantClient.getCollections();
        const exists = collections.collections.some(c => c.name === COLLECTION_NAME);

        if (!exists) {
            console.log(`Collection '${COLLECTION_NAME}' not found, creating new one (1024D, Cosine)...`);
            await qdrantClient.createCollection(COLLECTION_NAME, {
                vectors: {
                    size: 1024, // Jina V3 default dimension
                    distance: 'Cosine',
                },
            });
            console.log(`Qdrant collection '${COLLECTION_NAME}' created.`);
        } else {
            console.log(`Connected to existing Qdrant collection '${COLLECTION_NAME}'`);
        }

        return qdrantClient;
    } catch (error) {
        console.error('Failed to initialize Qdrant:', error);
        throw new Error(`Qdrant initialization failed: ${error.message}`);
    }
};

/**
 * Upsert document chunks into Qdrant
 * @param {Array<Object>} chunks - Array of chunk objects with text, embeddings, and metadata
 */
export const upsertChunks = async (chunks) => {
    try {
        await initializeQdrantDB();
        
        if (!chunks || chunks.length === 0) return 0;
        
        console.log(`Upserting ${chunks.length} chunks to Qdrant in batches of 50...`);
        
        const batchSize = 50;
        for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);
            const points = batch.map(chunk => ({
                id: chunk.id || uuidv4(),
                vector: chunk.embedding,
                payload: {
                    text: chunk.text,
                    ...chunk.metadata
                }
            }));

            await qdrantClient.upsert(COLLECTION_NAME, {
                wait: true,
                points: points
            });
            console.log(`   Uploaded points ${i + 1} to ${Math.min(i + batchSize, chunks.length)}`);
        }

        return chunks.length;
    } catch (error) {
        console.error('Error upserting to Qdrant:', error);
        throw error;
    }
};

/**
 * Query Qdrant for similar chunks
 * @param {Array<number>} queryEmbedding - Query vector
 * @param {number} topK - Number of results
 * @param {Object} filter - Metadata filters
 */
export const queryChunks = async (queryEmbedding, topK = 5, filter = null) => {
    try {
        await initializeQdrantDB();
        
        console.log(`Searching Qdrant (topK=${topK})...`);

        // Convert common MongoDB-style filters to Qdrant filters if needed (basic implementation)
        const qdrantFilter = filter ? formatFilter(filter) : undefined;

        const results = await qdrantClient.search(COLLECTION_NAME, {
            vector: queryEmbedding,
            limit: topK,
            filter: qdrantFilter,
            with_payload: true,
            with_vector: false
        });

        // Format results to match what the rest of the app expects (same as Chroma)
        return {
            ids: [results.map(r => r.id)],
            distances: [results.map(r => 1 - r.score)], // Qdrant score is similarity, Chroma uses distance
            metadatas: [results.map(r => r.payload)],
            documents: [results.map(r => r.payload.text)]
        };
    } catch (error) {
        console.error('Error querying Qdrant:', error);
        throw error;
    }
};

/**
 * Delete documents by metadata filter
 */
export const deleteDocumentChunks = async (documentId) => {
    try {
        await initializeQdrantDB();
        console.log(`Deleting chunks for document: ${documentId}`);
        
        await qdrantClient.delete(COLLECTION_NAME, {
            filter: {
                must: [
                    {
                        key: 'documentId',
                        match: { value: documentId }
                    }
                ]
            }
        });
    } catch (error) {
        console.error('Error deleting from Qdrant:', error);
        throw error;
    }
};

/**
 * Get collection statistics
 */
export const getStats = async () => {
    try {
        await initializeQdrantDB();
        const collectionInfo = await qdrantClient.getCollection(COLLECTION_NAME);
        return {
            count: collectionInfo.points_count,
            status: collectionInfo.status
        };
    } catch (error) {
        console.error('Error getting Qdrant stats:', error);
        return { count: 0, status: 'error' };
    }
};

/**
 * Basic formatter for filters (Map common metadata keys)
 */
function formatFilter(filter) {
    const must = [];
    
    for (const [key, value] of Object.entries(filter)) {
        if (value && typeof value === 'object' && value.$in) {
            must.push({
                key: key,
                match: { any: value.$in }
            });
        } else if (value) {
            must.push({
                key: key,
                match: { value: value }
            });
        }
    }
    
    return must.length > 0 ? { must } : undefined;
}
