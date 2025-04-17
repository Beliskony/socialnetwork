import { Request, Response } from 'express';
import User from '../models/User.model';

// Obtenir un utilisateur par nom
export const getUserByName = async (req: Request, res: Response) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({ message: 'Name query parameter is required' });
        }

        const users = await User.find({ name: { $regex: name, $options: 'i' } });

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found with the given name' });
        }

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while searching for users', error });
    }
};

// Créer un nouvel utilisateur
export const createUser = async (req: Request, res: Response) => {
    try {
        const user = new User(req.body);
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while creating the user', error });
    }
};

// Obtenir tous les utilisateurs
export const getAllUsers = async (_req: Request, res: Response) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while fetching users', error });
    }
};

// Mettre à jour un utilisateur par ID
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while updating the user', error });
    }
};

// Supprimer un utilisateur par ID
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while deleting the user', error });
    }
};