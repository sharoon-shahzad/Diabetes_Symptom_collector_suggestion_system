import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Document } from './models/Document.js';
import { initializeChromaDB, queryChunks, getCollectionStats } from './services/chromaService.js';
import { initializeEmbeddingModel, generateEmbedding } from './services/embeddingService.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Diavise';

/**
 * Test MongoDB document storage
 */
async function testMongoDBDocuments() {
    console.log('\n=== Testing MongoDB Document Storage ===\n');
    
    try {
        // Get all documents
        const documents = await Document.find().sort({ ingested_on: -1 });
        
        console.log(`✅ Total documents in MongoDB: ${documents.length}\n`);
        
        if (documents.length === 0) {
            console.log('⚠️  No documents found in MongoDB');
            return;
        }
        
        // Display summary of each document
        documents.forEach((doc, idx) => {
            console.log(`Document ${idx + 1}:`);
            console.log(`  - ID: ${doc.doc_id}`);
            console.log(`  - Title: ${doc.title}`);
            console.log(`  - Filename: ${doc.original_filename}`);
            console.log(`  - Type: ${doc.doc_type}`);
            console.log(`  - Source: ${doc.source}`);
            console.log(`  - Country: ${doc.country}`);
            console.log(`  - Pages: ${doc.page_count}`);
            console.log(`  - Chunks: ${doc.chunk_count}`);
            console.log(`  - Status: ${doc.status}`);
            console.log(`  - Ingested: ${doc.ingested_on.toISOString()}`);
            console.log('');
        });
        
        // Calculate total statistics
        const totalPages = documents.reduce((sum, doc) => sum + doc.page_count, 0);
        const totalChunks = documents.reduce((sum, doc) => sum + doc.chunk_count, 0);
        
        console.log('📊 Summary Statistics:');
        console.log(`  - Total Documents: ${documents.length}`);
        console.log(`  - Total Pages: ${totalPages}`);
        console.log(`  - Total Chunks: ${totalChunks}`);
        console.log(`  - Average Chunks per Document: ${(totalChunks / documents.length).toFixed(1)}`);
        
    } catch (error) {
        console.error('❌ Error checking MongoDB documents:', error);
    }
}

/**
 * Test ChromaDB collection
 */
async function testChromaDBCollection() {
    console.log('\n=== Testing ChromaDB Vector Storage ===\n');
    
    try {
        // Initialize ChromaDB
        await initializeChromaDB();
        
        // Get collection stats
        const stats = await getCollectionStats();
        console.log(`✅ ChromaDB Collection: ${stats.name}`);
        console.log(`✅ Total vectors stored: ${stats.count}\n`);
        
        if (stats.count === 0) {
            console.log('⚠️  No vectors found in ChromaDB');
        }
        
    } catch (error) {
        console.error('❌ Error checking ChromaDB:', error);
    }
}

/**
 * Test retrieval with sample queries
 */
async function testRetrieval() {
    console.log('\n=== Testing Document Retrieval ===\n');
    
    try {
        // Initialize embedding model and ChromaDB
        await initializeEmbeddingModel();
        await initializeChromaDB();
        
        // Test queries
        const testQueries = [
            'What are the dietary recommendations for diabetes patients?',
            'How to manage blood sugar during Ramadan fasting?',
            'What foods should diabetic patients avoid?',
            'Exercise recommendations for diabetes management',
            'Insulin management and dosage guidelines',
        ];
        
        for (const query of testQueries) {
            console.log(`\n🔍 Query: "${query}"\n`);
            
            // Generate embedding for query
            const queryEmbedding = await generateEmbedding(query);
            
            // Query ChromaDB for similar chunks
            const results = await queryChunks(queryEmbedding, 5);
            
            if (results.ids && results.ids[0] && results.ids[0].length > 0) {
                console.log(`Found ${results.ids[0].length} relevant chunks:\n`);
                
                // Display top results
                results.ids[0].forEach((id, idx) => {
                    const distance = results.distances[0][idx];
                    const similarity = (1 - distance).toFixed(4); // Convert cosine distance to similarity
                    const document = results.documents[0][idx];
                    const metadata = results.metadatas[0][idx];
                    
                    console.log(`Result ${idx + 1}:`);
                    console.log(`  - Chunk ID: ${id}`);
                    console.log(`  - Similarity: ${similarity} (${(similarity * 100).toFixed(2)}%)`);
                    console.log(`  - Source: ${metadata.title}`);
                    console.log(`  - Document Type: ${metadata.doc_type}`);
                    console.log(`  - Country: ${metadata.country}`);
                    console.log(`  - Page: ${metadata.page_no}`);
                    console.log(`  - Text Preview: ${document.substring(0, 150)}...`);
                    console.log('');
                });
            } else {
                console.log('⚠️  No results found');
            }
            
            console.log('---');
        }
        
    } catch (error) {
        console.error('❌ Error testing retrieval:', error);
    }
}

/**
 * Main test function
 */
async function runTests() {
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║   Document Storage & Retrieval Test Suite     ║');
    console.log('╚════════════════════════════════════════════════╝');
    
    try {
        // Connect to MongoDB
        console.log('\n📡 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB\n');
        
        // Run tests
        await testMongoDBDocuments();
        await testChromaDBCollection();
        await testRetrieval();
        
        console.log('\n✅ All tests completed successfully!\n');
        
    } catch (error) {
        console.error('\n❌ Test suite failed:', error);
    } finally {
        // Cleanup
        await mongoose.connection.close();
        console.log('📡 MongoDB connection closed');
        process.exit(0);
    }
}

// Run the test suite
runTests();
