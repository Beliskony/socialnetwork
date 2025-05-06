import { Schema, model } from 'mongoose';
const commentSchema = new Schema({
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
}, {
    timestamps: true,
});
export default model('Comment', commentSchema);
