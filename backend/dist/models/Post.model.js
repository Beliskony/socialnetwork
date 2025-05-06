import mongoose, { Schema } from 'mongoose';
const PostSchema = new Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, trim: true },
    media: {
        images: [{ type: String, trim: true }],
        videos: [{ type: String, trim: true }],
    },
}, {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
});
export default mongoose.model('Post', PostSchema);
