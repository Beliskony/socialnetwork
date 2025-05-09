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
            images: {
                type: [{ type: String, trim: true }],
                validate: {
                    validator: function (v: string[]) {
                        return v.length <= 5; // Limite à 5 images
                    },
                    message: 'Maximum 5 images are allowed.',
                },
            },
            videos: {
                type: [{ type: String, trim: true }],
                validate: {
                    validator: function (v: string[]) {
                        return v.length <= 2; // Limite à 2 vidéos
                    },
                    message: 'Maximum 2 videos are allowed.',
                },
            },
        },
    },
    {
        timestamps: true, // Ajoute automatiquement createdAt et updatedAt
    }
);

export default mongoose.model<IPost>('Post', PostSchema);