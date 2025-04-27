import { Request, Response } from 'express';
import LikeModel from '../models/Like.model';
import { inject,injectable } from 'inversify';
import { LikeProvider } from '../providers/Like.provider';


{/* // Ajouter un like
export const addLike = async (req: Request, res: Response) => {
    try {
        const { userId, postId } = req.body;

        const existingLike = await LikeModel.findOne({ userId, postId });
        if (existingLike) {
            return res.status(400).json({ message: 'Like already exists' });
        }

        const newLike = new LikeModel({ userId, postId });
        await newLike.save();

        res.status(201).json({ message: 'Like added successfully', like: newLike });
    } catch (error) {
        res.status(500).json({ message: 'Error adding like', error });
    }
};

// Supprimer un like
export const removeLike = async (req: Request, res: Response) => {
    try {
        const { userId, postId } = req.body;

        const like = await LikeModel.findOneAndDelete({ userId, postId });
        if (!like) {
            return res.status(404).json({ message: 'Like not found' });
        }

        res.status(200).json({ message: 'Like removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing like', error });
    }
};

// Obtenir tous les likes pour un post
export const getLikesForPost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;

        const likes = await LikeModel.find({ postId });
        res.status(200).json({ likes });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching likes', error });
    }
};*/}

@injectable()
export class LikeController {
    constructor(@inject(LikeProvider) private likeProvider: LikeProvider) {}

    async addLike(req: Request, res: Response) {
        try {
             const { userId, postId } = req.body;
             const existingLike = await this.likeProvider.hasUserLiked(userId, postId);

             if (existingLike) {
                 return res.status(400).json({ message: 'Like already exists' });
             }
        } catch (error) {
            return res.status(500).json({ message: 'Error checking like', error });
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