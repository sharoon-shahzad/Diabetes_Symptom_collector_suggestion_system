import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        lowercase : true,
        trim:true,
        index:true,     
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase : true,
        trim:true, 
    },
    password: {
        type: String,
        required: true,
    },
    date_of_birth: {
        type: Date,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
        default: null,
    },
   
    // isVerified: {
    //     type: Boolean,
    //     default: false,
    // },
    // isActive: {
    //     type: Boolean,
    //     default: true,
    // },
    
    // last_updated_at: {
    //     type: Date,
    //     default: Date.now,
    // },
} , {timestamps:true}); 

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});



userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}


userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
                id:this._id,
        },
         process.env.ACCESS_TOKEN_SECRET, 
         {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    );
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
                id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,

        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
}

export const User = mongoose.model('User', userSchema);
