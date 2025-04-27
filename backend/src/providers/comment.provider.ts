import { inject, injectable } from "inversify";
import { IComment } from "../models/Comment.model";
import { CommentService } from "../services/comment.service";

@injectable()
export class CommentProvider {
    constructor(@inject(CommentService) private commentService: CommentService) {}

    async addComment(postId: string, userId: string, content: string): Promise<IComment> {
        return await this.commentService.addComment(postId, userId, content);
    }

    async getCommentsByPostId(postId: string): Promise<IComment[]> {
        return await this.commentService.getCommentsByPostId(postId);
    }

    async updateComment(commentId: string, userId: string, content: string, newContent: string): Promise<IComment | null> {
        return await this.commentService.updateComment(commentId, userId, content, newContent);
    }

    async deleteComment(commentId: string, userId: string): Promise<boolean> {
        return await this.commentService.deleteComment(commentId, userId);
    }

    async getCommentsByPost(postId: string): Promise<IComment[]> {
        return await this.commentService.getCommentsByPost(postId);
    }

}
