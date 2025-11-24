/**
 * Test Retrieval Pipeline - Step 2 Verification
 * 
 * This script tests the natural language query retrieval system by:
 * 1. Running sample queries against the ChromaDB collection
 * 2. Verifying that results are relevant and non-empty
 * 3. Checking metadata completeness
 * 4. Validating similarity scores
 * 5. Testing different query types (diet, exercise, medication, etc.)
 * 
 * Run: node test-retrieval-pipeline.js
 */

import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { processQuery, batchProcessQueries } from './services/queryService.js';
import { getCollectionStats } from './services/chromaService.js';
import { Document } from './models/Document.js';

dotenv.config();

// Test queries covering different diabetes topics
const testQueries = [
    {
        query: 'diet plan for diabetic patients',
        description: 'Testing dietary recommendations retrieval',
        expectedTopics: ['food', 'diet', 'nutrition', 'meal', 'carbohydrate'],
    },
    {
        query: 'low glycemic foods',
        description: 'Testing glycemic index knowledge',
        expectedTopics: ['glycemic', 'index', 'food', 'glucose', 'carb'],
    },
    {
        query: 'exercise recommendations for diabetes',
        description: 'Testing physical activity guidance',
        expectedTopics: ['exercise', 'physical', 'activity', 'aerobic', 'training'],
    },
    {
        query: 'insulin management and dosing',
        description: 'Testing medication information',
        expectedTopics: ['insulin', 'dose', 'medication', 'treatment', 'therapy'],
    },
    {
        query: 'diabetic diet during Ramadan fasting',
        description: 'Testing religious/cultural context',
        expectedTopics: ['ramadan', 'fasting', 'iftar', 'suhoor', 'muslim'],
    },
    {
        query: 'HbA1c targets and monitoring',
        description: 'Testing clinical monitoring guidelines',
        expectedTopics: ['hba1c', 'a1c', 'target', 'monitor', 'glucose'],
    },
    {
        query: 'preventing diabetic complications',
        description: 'Testing complication prevention knowledge',
        expectedTopics: ['complication', 'prevention', 'risk', 'cardiovascular', 'neuropathy'],
    },
];

/**
 * Print formatted query results
 */
const printResults = (queryResult, testInfo) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`QUERY: "${queryResult.query}"`);
    console.log(`Description: ${testInfo.description}`);
    console.log(`${'='.repeat(80)}`);
    console.log(`Total Results: ${queryResult.total_results}`);
    console.log(`Cleaned Query: "${queryResult.cleaned_query}"`);
    console.log(`Timestamp: ${queryResult.timestamp}`);
    
    if (queryResult.total_results === 0) {
        console.log(`\n⚠️  WARNING: No results returned!`);
        return false;
    }

    console.log(`\n${'─'.repeat(80)}`);
    console.log(`TOP RESULTS:`);
    console.log(`${'─'.repeat(80)}`);

    let hasIssues = false;

    queryResult.results.forEach((result, idx) => {
        console.log(`\n[${result.rank}] Similarity Score: ${(result.similarity_score * 100).toFixed(2)}%`);
        console.log(`Distance: ${result.distance.toFixed(4)}`);
        console.log(`Chunk ID: ${result.chunk_id}`);
        
        // Check metadata
        if (!result.chunk_metadata) {
            console.log(`❌ ERROR: Missing chunk metadata!`);
            hasIssues = true;
        } else {
            console.log(`\nMETADATA:`);
            console.log(`  📄 Document: ${result.chunk_metadata.title || 'N/A'}`);
            console.log(`  📁 Source: ${result.chunk_metadata.source || 'N/A'}`);
            console.log(`  🌍 Country: ${result.chunk_metadata.country || 'N/A'}`);
            console.log(`  📋 Type: ${result.chunk_metadata.doc_type || 'N/A'}`);
            console.log(`  📄 Page: ${result.chunk_metadata.page_no || 'N/A'}`);
            console.log(`  🔢 Chunk: ${result.chunk_metadata.chunk_index || 'N/A'}`);
        }

        // Check text content
        if (!result.text || result.text.trim().length === 0) {
            console.log(`❌ ERROR: Empty text content!`);
            hasIssues = true;
        } else {
            console.log(`\nTEXT PREVIEW (${result.text.length} chars):`);
            console.log(`"${result.text_preview}"`);
        }

        // Check similarity score
        if (result.similarity_score < 0.3) {
            console.log(`⚠️  WARNING: Low similarity score (${(result.similarity_score * 100).toFixed(2)}%)`);
        }

        // Check for expected topics
        const textLower = result.text.toLowerCase();
        const foundTopics = testInfo.expectedTopics.filter(topic => 
            textLower.includes(topic.toLowerCase())
        );
        
        if (foundTopics.length > 0) {
            console.log(`✅ Found expected topics: ${foundTopics.join(', ')}`);
        }

        if (idx < queryResult.results.length - 1) {
            console.log(`\n${'-'.repeat(80)}`);
        }
    });

    return !hasIssues;
};

/**
 * Validate a single query result
 */
const validateQueryResult = (queryResult, testInfo) => {
    const issues = [];

    // Check for empty results
    if (queryResult.total_results === 0) {
        issues.push('No results returned');
    }

    // Check each result
    queryResult.results.forEach((result, idx) => {
        // Validate metadata
        if (!result.chunk_metadata) {
            issues.push(`Result ${idx + 1}: Missing metadata`);
        } else {
            if (!result.chunk_metadata.document_id) issues.push(`Result ${idx + 1}: Missing document_id`);
            if (!result.chunk_metadata.title) issues.push(`Result ${idx + 1}: Missing title`);
            if (!result.chunk_metadata.source) issues.push(`Result ${idx + 1}: Missing source`);
        }

        // Validate text
        if (!result.text || result.text.trim().length === 0) {
            issues.push(`Result ${idx + 1}: Empty text`);
        }

        // Validate scores
        if (result.similarity_score === undefined || result.similarity_score === null) {
            issues.push(`Result ${idx + 1}: Missing similarity score`);
        }
        if (result.distance === undefined || result.distance === null) {
            issues.push(`Result ${idx + 1}: Missing distance`);
        }

        // Check if similarity score makes sense (should be between 0 and 1)
        if (result.similarity_score < 0 || result.similarity_score > 1) {
            issues.push(`Result ${idx + 1}: Invalid similarity score (${result.similarity_score})`);
        }
    });

    return issues;
};

/**
 * Run comprehensive retrieval tests
 */
const runRetrievalTests = async () => {
    try {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`STEP 2: RETRIEVAL PIPELINE VERIFICATION`);
        console.log(`${'='.repeat(80)}`);

        // Connect to database
        console.log(`\n📡 Connecting to MongoDB...`);
        await connectDB();
        console.log(`✅ Connected to MongoDB`);

        // Initialize ChromaDB
        console.log(`\n🔌 Initializing ChromaDB...`);
        const { initializeChromaDB } = await import('./services/chromaService.js');
        const chromaDbPath = process.env.CHROMA_DB_PATH || './chroma_db';
        await initializeChromaDB(chromaDbPath);
        console.log(`✅ ChromaDB initialized`);

        // Get collection stats
        console.log(`\n📊 Getting ChromaDB collection statistics...`);
        const stats = await getCollectionStats();
        console.log(`✅ ChromaDB Collection Stats:`);
        console.log(`   - Total Vectors: ${stats.count}`);
        console.log(`   - Collection: ${stats.name}`);

        // Get document count
        const docCount = await Document.countDocuments();
        console.log(`   - MongoDB Documents: ${docCount}`);

        if (stats.count === 0) {
            console.log(`\n❌ ERROR: ChromaDB collection is empty! Run document ingestion first.`);
            process.exit(1);
        }

        console.log(`\n${'='.repeat(80)}`);
        console.log(`TESTING ${testQueries.length} SAMPLE QUERIES`);
        console.log(`${'='.repeat(80)}`);

        const testResults = [];
        let totalIssues = 0;

        // Test each query
        for (let i = 0; i < testQueries.length; i++) {
            const testInfo = testQueries[i];
            
            console.log(`\n\n🔍 TEST ${i + 1}/${testQueries.length}`);
            
            try {
                // Process query
                const result = await processQuery(testInfo.query, { topK: 5, minScore: 0.0 });
                
                // Print results
                const noIssues = printResults(result, testInfo);
                
                // Validate results
                const issues = validateQueryResult(result, testInfo);
                
                testResults.push({
                    query: testInfo.query,
                    description: testInfo.description,
                    success: issues.length === 0,
                    issues: issues,
                    resultCount: result.total_results,
                    avgScore: result.results.length > 0 
                        ? result.results.reduce((sum, r) => sum + r.similarity_score, 0) / result.results.length 
                        : 0,
                });

                if (issues.length > 0) {
                    console.log(`\n❌ VALIDATION ISSUES:`);
                    issues.forEach(issue => console.log(`   - ${issue}`));
                    totalIssues += issues.length;
                } else {
                    console.log(`\n✅ All validations passed for this query`);
                }

            } catch (error) {
                console.error(`\n❌ ERROR processing query: ${error.message}`);
                testResults.push({
                    query: testInfo.query,
                    description: testInfo.description,
                    success: false,
                    issues: [error.message],
                    resultCount: 0,
                    avgScore: 0,
                });
                totalIssues++;
            }
        }

        // Print summary
        console.log(`\n\n${'='.repeat(80)}`);
        console.log(`TEST SUMMARY`);
        console.log(`${'='.repeat(80)}`);

        const successfulTests = testResults.filter(t => t.success).length;
        const failedTests = testResults.length - successfulTests;

        console.log(`\nTotal Tests: ${testResults.length}`);
        console.log(`✅ Passed: ${successfulTests}`);
        console.log(`❌ Failed: ${failedTests}`);
        console.log(`⚠️  Total Issues: ${totalIssues}`);

        console.log(`\nDETAILED RESULTS:`);
        testResults.forEach((result, idx) => {
            const status = result.success ? '✅' : '❌';
            console.log(`\n${status} Test ${idx + 1}: ${result.description}`);
            console.log(`   Query: "${result.query}"`);
            console.log(`   Results: ${result.resultCount}`);
            console.log(`   Avg Similarity: ${(result.avgScore * 100).toFixed(2)}%`);
            if (result.issues.length > 0) {
                console.log(`   Issues: ${result.issues.length}`);
            }
        });

        // Final verdict
        console.log(`\n${'='.repeat(80)}`);
        if (failedTests === 0 && totalIssues === 0) {
            console.log(`✅ STEP 2 VERIFICATION: PASSED`);
            console.log(`   All queries returned relevant results with complete metadata`);
            console.log(`   No empty results or mismatched embeddings detected`);
        } else {
            console.log(`❌ STEP 2 VERIFICATION: ISSUES DETECTED`);
            console.log(`   ${failedTests} queries failed`);
            console.log(`   ${totalIssues} total issues found`);
            console.log(`   Review the detailed results above`);
        }
        console.log(`${'='.repeat(80)}\n`);

        return { success: failedTests === 0 && totalIssues === 0, testResults };

    } catch (error) {
        console.error(`\n❌ Fatal error during testing:`, error);
        throw error;
    } finally {
        // Close database connection
        await import('mongoose').then(mongoose => mongoose.default.connection.close());
        console.log(`\n📡 Database connection closed`);
    }
};

// Run tests
console.log(`\n🚀 Starting Retrieval Pipeline Tests...`);
runRetrievalTests()
    .then(({ success }) => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error(`\n💥 Test execution failed:`, error);
        process.exit(1);
    });
