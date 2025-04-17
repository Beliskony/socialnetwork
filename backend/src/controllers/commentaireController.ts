import { Request, Response } from 'express';
import Comment from '../models/Comment.model';

// Créer un nouveau commentaire
export const createComment = async (req: Request, res: Response) => {
    try {
        const { content, postId, userId } = req.body;
        const newComment = await Comment.create({ content, postId, userId });
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création du commentaire', error });
    }
};

// Récupérer tous les commentaires
export const getAllComments = async (req: Request, res: Response) => {
    try {
        const comments = await Comment.find();
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des commentaires', error });
    }
};

// Récupérer un commentaire par ID
export const getCommentById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: 'Commentaire non trouvé' });
        }
        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du commentaire', error });
    }
};

// Mettre à jour un commentaire
export const updateComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const comment = await Comment.findByIdAndUpdate(id);
        if (!comment) {
            return res.status(404).json({ message: 'Commentaire non trouvé' });
        }
        comment.content = content;
        await comment.save();
        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du commentaire', error });
    }
};

// Supprimer un commentaire
export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedcomment = await Comment.findByIdAndDelete(id);
        if (!deletedcomment) {
            return res.status(404).json({ message: 'Commentaire non trouvé' });
        }
        res.status(200).json({ message: 'Commentaire supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression du commentaire', error });
    }
};