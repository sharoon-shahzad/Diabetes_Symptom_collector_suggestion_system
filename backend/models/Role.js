import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({} ,{timestamps:true});

export const Role = mongoose.model('Role', roleSchema);