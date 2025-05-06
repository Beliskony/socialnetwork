import mongoose, { Schema } from 'mongoose';
const StorySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: {
        type: {
            type: String,
            enum: ['image', 'video'],
            required: true,
        },
        data: { type: String, required: true }, // URL du fichier
    },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24h après la création
});
// Optionnel : Ajouter un index pour supprimer automatiquement les stories expirées
StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model('Story', StorySchema);
