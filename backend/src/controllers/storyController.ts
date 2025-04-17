import { Request, Response } from 'express';
import Story from '../models/Story.model';

// Créer une nouvelle story
export const createStory = async (req: Request, res: Response) => {
    try {
        const { title, content, author } = req.body;

        const newStory = new Story({
            title,
            content,
            author,
            postedAt: new Date(),
        });

        await newStory.save();
        res.status(201).json({ message: 'Story created successfully', story: newStory });
    } catch (error) {
        res.status(500).json({ message: 'Error creating story', error });
    }
};

// Récupérer toutes les stories
export const getStories = async (req: Request, res: Response) => {
    try {
        const stories = await Story.find();
        res.status(200).json(stories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stories', error });
    }
};

// Récupérer une story par ID
export const getStoryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const story = await Story.findById(id);

        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        res.status(200).json(story);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching story', error });
    }
};


// Supprimer une story
export const deleteStory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedStory = await Story.findByIdAndDelete(id);

        if (!deletedStory) {
            return res.status(404).json({ message: 'Story not found' });
        }

        res.status(200).json({ message: 'Story deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting story', error });
    }
};