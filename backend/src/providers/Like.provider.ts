import { inject, injectable } from "inversify";
import { LikeService } from "../services/Like.service";


@injectable()
export class LikeProvider {
    constructor( @inject(LikeService) private likeService: LikeService) {}

    async addLike(userId: string, postId: string): Promise<void> {
        return this.likeService.addLike(userId, postId);
    }

    async removeLike(userId: string, postId: string): Promise<void> {
        return this.likeService.removeLike(userId, postId);
    }

    async getLikesByPost(postId: string): Promise<number> {
        return this.likeService.getLikesByPost(postId);
    }

    async hasUserLiked(userId: string, postId: string): Promise<boolean> {
        return this.likeService.hasUserLiked(userId, postId);
    }

}