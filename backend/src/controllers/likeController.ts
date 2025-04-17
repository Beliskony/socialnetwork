import { Request, Response } from 'express';
import Like from '../models/Like.model';

// Ajouter un like
export const addLike = async (req: Request, res: Response) => {
    try {
        const { userId, postId } = req.body;

        const existingLike = await Like.findOne({ userId, postId });
        if (existingLike) {
            return res.status(400).json({ message: 'Like already exists' });
        }

        const newLike = new Like({ userId, postId });
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

        const like = await Like.findOneAndDelete({ userId, postId });
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

        const likes = await Like.find({ postId });
        res.status(200).json({ likes });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching likes', error });
    }
};