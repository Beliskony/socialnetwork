var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { injectable } from "inversify";
import CommentModel from "../models/Comment.model";
let CommentService = class CommentService {
    // Add a comment to a post
    async addComment(postId, userId, content) {
        const newComment = new CommentModel({
            user: userId,
            post: postId,
            content: content,
        });
        return await newComment.save();
    }
    async getCommentsByPostId(postId) {
        return await CommentModel.find({ post: postId }).populate("user", "username").exec();
    }
    async getCommentsByPost(postId) {
        return await CommentModel.find({ post: postId }).populate("user", "username").exec();
    }
    async updateComment(commentId, userId, content, newContent) {
        const upComment = await CommentModel.findById(commentId);
        if (!upComment || upComment.user !== userId) {
            throw new Error("Comment not found ou pas autoiser a modifier ce commentaire");
        }
        upComment.content = newContent;
        return await upComment.save();
    }
    async deleteComment(commentId, userId) {
        const delComment = await CommentModel.findById(commentId);
        if (!delComment || delComment.user !== userId) {
            throw new Error("Comment not found ou pas autoiser a supprimer ce commentaire");
        }
        await CommentModel.findByIdAndDelete(commentId);
        return true;
    }
};
CommentService = __decorate([
    injectable()
], CommentService);
export { CommentService };
