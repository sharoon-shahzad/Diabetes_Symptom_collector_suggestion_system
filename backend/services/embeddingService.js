import { pipeline } from '@xenova/transformers';

// Cache the embedding model pipeline
let embeddingPipeline = null;

/**
 * Initialize the embedding model
 * @param {string} modelName - Model identifier (default: sentence-transformers/all-MiniLM-L6-v2)
 * @returns {Promise<void>}
 */
export const initializeEmbeddingModel = async (modelName = 'Xenova/all-MiniLM-L6-v2') => {
    try {
        if (embeddingPipeline) {
            console.log('Embedding model already initialized');
            return;
        }
        
        console.log(`Initializing embedding model: ${modelName}...`);
        embeddingPipeline = await pipeline('feature-extraction', modelName);
        console.log('Embedding model initialized successfully');
    } catch (error) {
        console.error('Failed to initialize embedding model:', error);
        throw new Error(`Embedding model initialization failed: ${error.message}`);
    }
};

/**
 * Generate embedding for a single text chunk
 * @param {string} text - Text to embed
 * @returns {Promise<Array<number>>} - Embedding vector
 */
export const generateEmbedding = async (text) => {
    try {
        if (!embeddingPipeline) {
            await initializeEmbeddingModel();
        }
        
        // Generate embedding
        const output = await embeddingPipeline(text, {
            pooling: 'mean',
            normalize: true,
        });
        
        // Convert to array
        const embedding = Array.from(output.data);
        
        return embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw new Error(`Failed to generate embedding: ${error.message}`);
    }
};

/**
 * Generate embeddings for multiple text chunks in batches
 * @param {Array<string>} texts - Array of text chunks
 * @param {number} batchSize - Batch size for processing
 * @returns {Promise<Array<Array<number>>>} - Array of embedding vectors
 */
export const generateEmbeddingsBatch = async (texts, batchSize = 10) => {
    try {
        if (!embeddingPipeline) {
            await initializeEmbeddingModel();
        }
        
        const embeddings = [];
        const totalBatches = Math.ceil(texts.length / batchSize);
        
        console.log(`Generating embeddings for ${texts.length} chunks in ${totalBatches} batches...`);
        
        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);
            const batchNumber = Math.floor(i / batchSize) + 1;
            
            console.log(`Processing batch ${batchNumber}/${totalBatches}...`);
            
            // Process batch
            const batchEmbeddings = await Promise.all(
                batch.map(text => generateEmbedding(text))
            );
            
            embeddings.push(...batchEmbeddings);
        }
        
        console.log(`Successfully generated ${embeddings.length} embeddings`);
        return embeddings;
    } catch (error) {
        console.error('Error generating batch embeddings:', error);
        throw new Error(`Failed to generate batch embeddings: ${error.message}`);
    }
};

/**
 * Get embedding dimension
 * @returns {number}
 */
export const getEmbeddingDimension = () => {
    // all-MiniLM-L6-v2 produces 384-dimensional embeddings
    return 384;
};

/**
 * Check if embedding model is initialized
 * @returns {boolean}
 */
export const isEmbeddingModelInitialized = () => {
    return embeddingPipeline !== null;
};
