import mongoose, { Schema, Document } from 'mongoose';

export interface IStoryContent {
    type: 'image' | 'video'; // Type de contenu
    data: string; // URL du fichier (image/vidéo)
}

export interface IStory extends Document {
    userId: mongoose.Types.ObjectId; // Référence à l'utilisateur qui a créé la story
    content: IStoryContent; // Contenu de la story
    createdAt: Date; // Date de création de la story
    expiresAt: Date; // Date d'expiration de la story (24h après la création)
}

const StorySchema: Schema = new Schema<IStory>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: {
        type: {
            type: String,
            enum: ['image', 'video'], // Types de contenu autorisés
            required: true,
        },
        data: { type: String, required: true }, // URL du fichier
    },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24h après la création
});

// Optionnel : Ajouter un index pour supprimer automatiquement les stories expirées
StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IStory>('Story', StorySchema);