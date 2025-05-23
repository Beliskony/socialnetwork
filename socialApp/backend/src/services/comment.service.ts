import { injectable } from "inversify";
import CommentModel, {IComment} from "../models/Comment.model";

@injectable()
export class CommentService {
 

    // Add a comment to a post
    async addComment(postId: string, userId: string, content: string): Promise<IComment> {
        const newComment =  new CommentModel({
            user: userId,
            post: postId,
            content: content, });

            return await newComment.save();
        }

    
    async getCommentsByPostId(postId: string): Promise<IComment[]> {
        return await CommentModel.find({ post: postId }).populate("user", "username").exec();
    }

    async getCommentsByPost(postId: string): Promise<IComment[]> {
        return await CommentModel.find({ post: postId }).populate("user", "username").exec();
    }

    async updateComment(commentId: string, userId: string, content: string, newContent: string): Promise<IComment | null> {
        const upComment = await CommentModel.findById(commentId)

            if (!upComment || upComment.user !== userId) {
                throw new Error("Comment not found ou pas autoiser a modifier ce commentaire");
            }

            upComment.content = newContent;
            return await upComment.save();
        }

    async deleteComment(commentId: string, userId: string): Promise<boolean> {
        const delComment = await CommentModel.findById(commentId)
            if (!delComment || delComment.user !== userId) {
                throw new Error("Comment not found ou pas autoiser a supprimer ce commentaire");
            }

            await CommentModel.findByIdAndDelete(commentId);
            return true
        }
    
}