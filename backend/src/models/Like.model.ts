import mongoose, { Schema, model, Document } from 'mongoose';

export interface ILike extends Document {
    userId: string;
    postId: string;
    isLiked: boolean;
}

const LikeSchema = new Schema<ILike>(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
        postId: {
            type: String,
            required: true,
            index: true,
        },
        isLiked: {
            type: Boolean,
            required: true,
            default: true,
        },
    },
    {
        timestamps: true, // Ajoute createdAt et updatedAt automatiquement
    }
);

// Empêche un utilisateur de liker plusieurs fois la même publication
LikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

export default mongoose.model<ILike>('Like', LikeSchema);