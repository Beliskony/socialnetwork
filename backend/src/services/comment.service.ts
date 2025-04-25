import { injectable } from "inversify";

@injectable()
export class CommentService {
    private comments: { id: number; postId: number; userId: number; content: string }[] = [];
    private currentId = 1;

    // Get comments for a specific post
    getCommentsByPost(postId: number): { id: number; postId: number; userId: number; content: string }[] {
        return this.comments.filter(comment => comment.postId === postId);
    }

    // Add a comment to a post
    addComment(postId: number, userId: number, content: string): { id: number; postId: number; userId: number; content: string } {
        const newComment = { id: this.currentId++, postId, userId, content };
        this.comments.push(newComment);
        return newComment;
    }

    // Update a comment made by the user
    updateComment(commentId: number, userId: number, newContent: string): boolean {
        const comment = this.comments.find(c => c.id === commentId && c.userId === userId);
        if (!comment) {
            return false; // Comment not found or user not authorized
        }
        comment.content = newContent;
        return true;
    }

    // Delete a comment made by the user
    deleteComment(commentId: number, userId: number): boolean {
        const commentIndex = this.comments.findIndex(c => c.id === commentId && c.userId === userId);
        if (commentIndex === -1) {
            return false; // Comment not found or user not authorized
        }
        this.comments.splice(commentIndex, 1);
        return true;
    }
}