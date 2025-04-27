import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { StoryProvider } from "../providers/Story.provider";

@injectable()
export class StoryController {
  constructor(@inject(StoryProvider) private storyProvider: StoryProvider) {}

  async createStory(req: Request, res: Response) {
    try {
        const { userId, content } = req.body;
        const story = await this.storyProvider.createStory({ userId, content });
        res.status(201).json(story);
    } catch (error) {
        console.error("Erreur lors de la création de la story:", error);
        res.status(500).json({ message: "Erreur lors de la création de la story" });
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
    try {
        const { storyId } = req.params;
        await this.storyProvider.deleteExpiredStories(storyId);
        res.status(204).send();
    } catch (error) {
        console.error("Erreur lors de la suppression des stories expirées:", error);
        res.status(500).json({ message: "Erreur lors de la suppression des stories expirées" });
    }
  }
    
}