/**
 * Embedding Service — powered by Jina AI Embeddings API
 *
 * Replaces the local @xenova/transformers ONNX model with a free cloud API.
 * Sign up at https://jina.ai to get a free API key (1M tokens/month, no credit card).
 * Set JINA_API_KEY in your environment variables.
 *
 * Model: jina-embeddings-v3  |  Output dimension: 1024
 */

const JINA_API_URL = 'https://api.jina.ai/v1/embeddings';
const JINA_MODEL   = 'jina-embeddings-v3';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getJinaKey() {
    const key = process.env.JINA_API_KEY;
    if (!key) throw new Error('JINA_API_KEY is not set. Get a free key at https://jina.ai');
    return key;
}

/**
 * Initialize embedding model — no-op for Jina (no local model to load).
 * Kept for API compatibility with existing callers.
 */
export const initializeEmbeddingModel = async () => {
    console.log('Embedding service: using Jina AI API (jina-embeddings-v3, dim=1024)');
};

/**
 * Generate embedding for a single text chunk via Jina AI API
 * @param {string} text - Text to embed
 * @returns {Promise<Array<number>>} - 1024-dimensional embedding vector
 */
export const generateEmbedding = async (text) => {
    try {
        const response = await fetch(JINA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getJinaKey()}`,
            },
            body: JSON.stringify({
                model: JINA_MODEL,
                input: [text],
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Jina API error ${response.status}: ${err}`);
        }

        const json = await response.json();
        const embedding = json?.data?.[0]?.embedding;

        if (!embedding) throw new Error('Jina API returned no embedding data');
        return embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw new Error(`Failed to generate embedding: ${error.message}`);
    }
};

/**
 * Generate embeddings for multiple text chunks via Jina AI API
 * Jina supports up to 2048 texts per batch — we use 20 to stay under rate limits.
 * @param {Array<string>} texts - Array of text chunks
 * @param {number} batchSize - Texts per API call (default 20)
 * @returns {Promise<Array<Array<number>>>} - Array of 1024-dimensional embedding vectors
 */
export const generateEmbeddingsBatch = async (texts, batchSize = 20) => {
    try {
        const embeddings = [];
        const totalBatches = Math.ceil(texts.length / batchSize);
        console.log(`Jina AI: generating embeddings for ${texts.length} chunks in ${totalBatches} batch(es)...`);

        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);
            const batchNum = Math.floor(i / batchSize) + 1;
            console.log(`Processing batch ${batchNum}/${totalBatches}...`);

            const response = await fetch(JINA_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getJinaKey()}`,
                },
                body: JSON.stringify({
                    model: JINA_MODEL,
                    input: batch,
                }),
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Jina API error ${response.status}: ${err}`);
            }

            const json = await response.json();
            const batchEmbeddings = json.data.map(item => item.embedding);
            embeddings.push(...batchEmbeddings);

            // Add a 12s pause between batches to strictly respect rate limits (100k tokens/min)
            if (i + batchSize < texts.length) {
                console.log('   Waiting 12s before next batch to avoid rate limits...');
                await sleep(12000);
            }
        }

        console.log(`Successfully generated ${embeddings.length} embeddings`);
        return embeddings;
    } catch (error) {
        console.error('Error generating batch embeddings:', error);
        throw new Error(`Failed to generate batch embeddings: ${error.message}`);
    }
};

/**
 * Get embedding dimension for jina-embeddings-v3
 * @returns {number}
 */
export const getEmbeddingDimension = () => {
    // jina-embeddings-v3 produces 1024-dimensional embeddings
    return 1024;
};

/**
 * Check if embedding service is ready (always true for API-based service)
 * @returns {boolean}
 */
export const isEmbeddingModelInitialized = () => {
    return !!process.env.JINA_API_KEY;
};
