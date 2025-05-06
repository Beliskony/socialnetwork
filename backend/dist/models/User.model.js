import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: '' }, // URL or path to the profile picture
    phoneNumber: { type: String, unique: true, sparse: true }, // Optional and unique
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of User references
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});
export default mongoose.model('User', UserSchema);
