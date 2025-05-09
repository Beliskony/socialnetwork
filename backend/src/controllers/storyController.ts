import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { StoryProvider } from "../providers/Story.provider";
import { TYPES } from "../config/TYPES";

@injectable()
export class StoryController {
  constructor(@inject(TYPES.StoryProvider) private storyProvider: StoryProvider) {}

  async createStory(req: Request, res: Response) {
    try {
        const userId = req.params.userId;
        const content = req.body.content; // Assuming content is passed in the request body
        const story = await this.storyProvider.createStory({ userId, content });
        res.status(201).json(story);
        return
    } catch (error) {
        console.error("Erreur lors de la création de la story:", error);        
        res.status(500).json({ message: "Erreur lors de la création de la story" });
        console.log(error);
        
    }
  }

  async getUserStories(req: Request, res: Response) {
    try {
        const { userId } = req.params;
        const stories = await this.storyProvider.getUserStories(userId);
        res.status(200).json(stories);
    } catch (error) {
        console.error("Erreur lors de la récupération des stories:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des stories" });
    }
  }

  async deleteExpiredStories(req: Request, res: Response) {
   await this.storyProvider.deleteExpiredStories();
    res.status(204).send(); // No content
  }

  async deleteUserStory(req: Request, res: Response) {
    try {
        const { storyId } = req.params;
        const userId = req.params.userId; // Assuming userId is passed in the request params

        if (!userId) {
            return res.status(401).json({ message: "Utilisateur non authentifié" });
        }

        await this.storyProvider.deleteUserStory(storyId, userId);
        res.status(204).send(); // No content
    } catch (error) {
        console.error("Erreur lors de la suppression de la story:", error);
        res.status(500).json({ message: "Erreur lors de la suppression de la story" });
    }
}

}