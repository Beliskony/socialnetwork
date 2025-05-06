var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { injectable } from "inversify";
import LikeModel from "../models/Like.model";
let LikeService = class LikeService {
    async addLike(userId, postId) {
        const like = new LikeModel({ userId, postId });
        await like.save();
    }
    async removeLike(userId, postId) {
        await LikeModel.deleteOne({ userId, postId });
    }
    async getLikesByPost(postId) {
        return await LikeModel.countDocuments({ postId });
    }
    async hasUserLiked(userId, postId) {
        const like = await LikeModel.findOne({ userId, postId });
        return !!like;
    }
};
LikeService = __decorate([
    injectable()
], LikeService);
export { LikeService };
export default new LikeService();
//compare ce snippet avec celui de Like.model.ts
