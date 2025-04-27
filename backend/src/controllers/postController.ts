import { Request, Response } from 'express';
import { PostService } from '../services/Post.service';
import { inject } from 'inversify';
import { PostProvider } from '../providers/Post.provider';
import { IPost } from '../models/Post.model';


export class PostController {
    constructor( @inject(PostService) private postProvider: PostProvider) {}

    async createPost(req: Request, res: Response): Promise<Response> {
        try {
            const { userId, text, media } = req.body;
            const post: IPost = await this.postProvider.createPost(userId, text, media);
            return res.status(201).json(post);
        } catch (error) {
            return res.status(500).json({ message: 'Error creating post', error });
        }
    }

    async getPosts(req: Request, res: Response): Promise<Response> {
        try {
            const {text} = req.query;
            const posts: IPost[] | null = await this.postProvider.getPosts(text as string);
            return res.status(200).json(posts);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching posts', error });
        }
    }

    async getAllPosts(req: Request, res: Response): Promise<Response> {
        try {
            const posts = await this.postProvider.getAllPosts();
            return res.status(200).json(posts);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching posts', error });
        }
    }

    async updatePost(req: Request, res: Response): Promise<Response> {
        try {
            const { postId, userId, text, media } = req.body;
            const post: IPost | null = await this.postProvider.updatePost(postId, userId, text, media);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }
            return res.status(200).json(post);
        } catch (error) {
            return res.status(500).json({ message: 'Error updating post', error });
        }
    }

    async deletePost(req: Request, res: Response): Promise<Response> {
        try {
            const { postId, userId } = req.body;
            const deleted: boolean = await this.postProvider.deletePost(postId, userId);
            if (!deleted) {
                return res.status(404).json({ message: 'Post not found' });
            }
            return res.status(200).json({ message: 'Post deleted successfully' });
        } catch (error) {
            return res.status(500).json({ message: 'Error deleting post', error });
        }
    }
}