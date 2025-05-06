var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { injectable } from "inversify";
import PostModel from "../models/Post.model";
let PostService = class PostService {
    async createPost(userId, text, media) {
        const newPost = new PostModel({
            user: userId,
            text,
            media,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return await newPost.save();
    }
    async getPosts(text) {
        return await PostModel.find({
            $or: [
                { text: { $regex: text, $options: 'i' } }, // Recherche insensible à la casse
                //{ 'media.images': { $regex: text, $options: 'i' } }, // Recherche dans les images
                //{ 'media.videos': { $regex: text, $options: 'i' } }, // Recherche dans les vidéos
            ],
        }).populate('userId');
    }
    async getAllPosts() {
        return await PostModel.find().populate('userId').sort({ createdAt: -1 }).exec();
    }
    async updatePost(postId, userId, text, media) {
        const post = await PostModel.findById(postId);
        if (post?.user.toString() !== userId) {
            throw new Error("You are not authorized to modify this post");
        }
        post.text = text || post.text;
        post.media = media || post.media;
        post.updatedAt = new Date();
        return await post.save();
    }
    async deletePost(postId, userId) {
        const post = await PostModel.findById(postId);
        if (post?.user.toString() !== userId) {
            throw new Error("You are not authorized to modify this post");
        }
        await PostModel.findByIdAndDelete(postId);
        return true;
    }
};
PostService = __decorate([
    injectable()
], PostService);
export { PostService };
