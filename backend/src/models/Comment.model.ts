import { Schema, model } from 'mongoose';

export interface IComment {
    user: string; // User ID
    post: string; // Post ID
    content: string; // Comment content
    createdAt?: Date; // Optional createdAt field
}

const commentSchema = new Schema<IComment>(
    {
        user: { 
            type: String,
             required: true 
            },

        post: { 
            type: String, 
            required: true 
            },

        content: { 
            type: String, 
            required: true 
            },

        createdAt: { 
            type: Date, 
            default: Date.now 
        },
    },
    {
        timestamps: true,
    }
);

export default model<IComment>('Comment', commentSchema);