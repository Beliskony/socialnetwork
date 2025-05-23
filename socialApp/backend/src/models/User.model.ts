import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    id: string; 
    username: string;
    email: string;
    password: string;
    profilePicture?: string;
    phoneNumber?: string;
    followers: mongoose.Types.ObjectId[];
    otp?: string;
    otpExpires?:number;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        profilePicture: { type: String, default: '' }, // URL or path to the profile picture
        phoneNumber: { type: String, unique: true, sparse: true, require:true },
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of User references
        otp: { type: String}, // OTP for verification
        otpExpires: { type: Number }, // Expiration time for OTP
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

export default mongoose.model<IUser>('User', UserSchema);