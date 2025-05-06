var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { PostService } from '../services/Post.service';
import { inject } from 'inversify';
import { PostProvider } from '../providers/Post.provider';
let PostController = class PostController {
    postProvider;
    constructor(postProvider) {
        this.postProvider = postProvider;
    }
    async createPost(req, res) {
        try {
            const { userId, text, media } = req.body;
            const post = await this.postProvider.createPost(userId, text, media);
            return res.status(201).json(post);
        }
        catch (error) {
            return res.status(500).json({ message: 'Error creating post', error });
        }
    }
    async getPosts(req, res) {
        try {
            const { text } = req.query;
            const posts = await this.postProvider.getPosts(text);
            return res.status(200).json(posts);
        }
        catch (error) {
            return res.status(500).json({ message: 'Error fetching posts', error });
        }
    }
    async getAllPosts(req, res) {
        try {
            const posts = await this.postProvider.getAllPosts();
            return res.status(200).json(posts);
        }
        catch (error) {
            return res.status(500).json({ message: 'Error fetching posts', error });
        }
    }
    async updatePost(req, res) {
        try {
            const { postId, userId, text, media } = req.body;
            const post = await this.postProvider.updatePost(postId, userId, text, media);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }
            return res.status(200).json(post);
        }
        catch (error) {
            return res.status(500).json({ message: 'Error updating post', error });
        }
    }
    async deletePost(req, res) {
        try {
            const { postId, userId } = req.body;
            const deleted = await this.postProvider.deletePost(postId, userId);
            if (!deleted) {
                return res.status(404).json({ message: 'Post not found' });
            }
            return res.status(200).json({ message: 'Post deleted successfully' });
        }
        catch (error) {
            return res.status(500).json({ message: 'Error deleting post', error });
        }
    }
};
PostController = __decorate([
    __param(0, inject(PostService)),
    __metadata("design:paramtypes", [PostProvider])
], PostController);
export { PostController };
