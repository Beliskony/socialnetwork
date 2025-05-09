import { inject, injectable } from "inversify";
import { PostService } from "../services/Post.service";
import { IPost } from "../models/Post.model";
import { TYPES } from "../config/TYPES";

@injectable()
export class PostProvider {
    constructor(@inject(TYPES.PostService) private postService: PostService) {}

    async createPost(userId: string, text?:string, media?: {images?: string[], videos?: string[]}): Promise<IPost> {
        return this.postService.createPost(userId, text, media);
    }

    async getPosts(text: string): Promise<IPost[] | null> {
        return this.postService.getPosts(text);
    }

    async getAllPosts(): Promise<IPost[] | null> {
        return this.postService.getAllPosts();
    }

    async updatePost(postId: string,userId:string ,text?: string, media?: {images?: string[], videos?: string[]}): Promise<IPost | null> {
        return this.postService.updatePost(postId,userId ,text, media);
    }

    async deletePost(postId: string, userId: string): Promise<boolean> {
        return this.postService.deletePost(postId, userId);
    }
}