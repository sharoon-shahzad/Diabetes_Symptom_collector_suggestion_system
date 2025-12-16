import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const documentSchema = new mongoose.Schema({
      doc_id: String,
      original_filename: String,
      title: String,
      source: String,
      country: String,
      doc_type: String,
      version: String,
      ingested_on: Date,
      chunk_count: Number
    });

    const Document = mongoose.model('Document', documentSchema);

    // Fetch all documents
    const documents = await Document.find().select('doc_id original_filename title source country doc_type version chunk_count ingested_on').sort({ ingested_on: -1 });

    console.log('\n=== ALL UPLOADED DOCUMENTS ===\n');
    documents.forEach((doc, index) => {
      console.log(`\n${index + 1}. ${doc.original_filename}`);
      console.log(`   Title: ${doc.title}`);
      console.log(`   Source: ${doc.source}`);
      console.log(`   Country: ${doc.country}`);
      console.log(`   Doc Type: ${doc.doc_type}`);
      console.log(`   Version: ${doc.version}`);
      console.log(`   Chunks: ${doc.chunk_count}`);
      console.log(`   Uploaded: ${new Date(doc.ingested_on).toLocaleDateString()}`);
    });

    console.log('\n\n=== FORMATTED FOR COPY-PASTE ===\n');
    documents.forEach((doc) => {
      console.log(`title: "${doc.title}"`);
      console.log(`source: "${doc.source}"`);
      console.log(`country: "${doc.country}"`);
      console.log(`doc_type: "${doc.doc_type}"`);
      console.log(`version: "${doc.version}"`);
      console.log(`file: "${doc.original_filename}"`);
      console.log('---');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

connectDB();
