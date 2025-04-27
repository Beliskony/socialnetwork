import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
    user: mongoose.Types.ObjectId; // Référence à l'utilisateur
    text?: string;
    media?: {
        images?: string[]; // URLs des images
        videos?: string[]; // URLs des vidéos
    };
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema: Schema = new Schema(
    {
        user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, trim: true },
        media: {
            images: [{ type: String, trim: true }],
            videos: [{ type: String, trim: true }],
        },
    },
    {
        timestamps: true, // Ajoute automatiquement createdAt et updatedAt
    }
);

export default mongoose.model<IPost>('Post', PostSchema);