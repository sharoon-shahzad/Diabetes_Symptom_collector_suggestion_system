import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/Diavise';
        if (typeof uri !== 'string' || uri.trim() === '') {
            throw new Error('MONGO_URI is not set or is not a string. Set MONGO_URI in your .env');
        }
        // Provide explicit options for compatibility
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};