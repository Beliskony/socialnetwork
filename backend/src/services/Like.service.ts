import { injectable } from "inversify";
import LikeModel, {ILike} from "../models/Like.model";

@injectable()
export class LikeService {
    async addLike(userId: string, postId: string): Promise<void> {
        const like = new LikeModel({ userId, postId });
        await like.save();
    }

    async removeLike(userId: string, postId: string): Promise<void> {
        await LikeModel.deleteOne({ userId, postId });
    }

    async getLikesByPost(postId: string): Promise<number> {
        return await LikeModel.countDocuments({ postId });
    }

    async hasUserLiked(userId: string, postId: string): Promise<boolean> {
        const like = await LikeModel.findOne({ userId, postId });
        return !!like;
    }
}

export default new LikeService();
//compare ce snippet avec celui de Like.model.ts