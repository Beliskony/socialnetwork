import { Request, Response } from 'express';
import { inject,injectable } from 'inversify';
import { LikeProvider } from '../providers/Like.provider';
import { TYPES } from '../config/TYPES';

@injectable()
export class LikeController {
    constructor(@inject(TYPES.LikeProvider) private likeProvider: LikeProvider) {}

    async addLike(req: Request, res: Response) {
        try {
             const { userId, postId } = req.body;
             const existingLike = await this.likeProvider.hasUserLiked(userId, postId);

             if (existingLike) {
                  res.status(400).json({ message: 'Like already exists' });
             }
             await this.likeProvider.addLike(userId, postId);
             res.status(201).json({ message: 'Like added successfully' });
        } catch (error) {
             res.status(500).json({ message: 'Error checking like', error });
        }
    }

    async removeLike(req: Request, res: Response) {
        try {
            const { userId, postId } = req.body;
            await this.likeProvider.removeLike(userId, postId);
            res.status(200).json({ message: 'Like removed successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error removing like', error });
        }
    }

    async getLikesForPost(req: Request, res: Response) {
        try {
            const { postId } = req.params;
            const likes = await this.likeProvider.getLikesByPost(postId);
            res.status(200).json({ likes });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching likes', error });
        }
    }

    async hasUserLiked(req: Request, res: Response) {
        try {
            const { userId, postId } = req.body;
            const hasLiked = await this.likeProvider.hasUserLiked(userId, postId);
            res.status(200).json({ hasLiked });
        } catch (error) {
            res.status(500).json({ message: 'Error checking like', error });
        }
    }

}