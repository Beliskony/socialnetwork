import { inject, injectable } from "inversify";
import { LikeService } from "../services/Like.service";
import { ILike } from "../models/Like.model";
import { TYPES } from "../config/TYPES";


@injectable()
export class LikeProvider {
    constructor( @inject(TYPES.LikeService) private likeService: LikeService) {}

    async addLike(userId: string, postId: string): Promise<void> {
        return this.likeService.addLike(userId, postId);
    }

    async removeLike(userId: string, postId: string): Promise<void> {
        return this.likeService.removeLike(userId, postId);
    }

    async getLikesByPost(postId: string): Promise<ILike[]> {
        return this.likeService.getLikesByPost(postId);
    }

    async hasUserLiked(userId: string, postId: string): Promise<boolean> {
        return this.likeService.hasUserLiked(userId, postId);
    }

}