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
import { inject, injectable } from "inversify";
import { PostService } from "../services/Post.service";
let PostProvider = class PostProvider {
    postService;
    constructor(postService) {
        this.postService = postService;
    }
    async createPost(userId, text, media) {
        return this.postService.createPost(userId, text, media);
    }
    async getPosts(text) {
        return this.postService.getPosts(text);
    }
    async getAllPosts() {
        return this.postService.getAllPosts();
    }
    async updatePost(postId, userId, text, media) {
        return this.postService.updatePost(postId, userId, text, media);
    }
    async deletePost(postId, userId) {
        return this.postService.deletePost(postId, userId);
    }
};
PostProvider = __decorate([
    injectable(),
    __param(0, inject(PostService)),
    __metadata("design:paramtypes", [PostService])
], PostProvider);
export { PostProvider };
