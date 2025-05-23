import { Router } from "express";
import { StoryController } from "../controllers/storyController";
import StoryMiddleware from "../middlewares/StoryMiddleware";
import { DeleteStoryZodSchema, StoryZodSchema } from "../schemas/Story.ZodSchema";
import { inject, injectable } from "inversify";
import { TYPES } from "../config/TYPES";

@injectable()
export class StoryRouter {
    public router: Router;
    private storyController: StoryController;
  

    constructor(
        @inject(TYPES.StoryController) storyController: StoryController) 
        
        {
        this.router = Router();
        this.storyController = storyController;
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post("/create/:userId", StoryMiddleware(StoryZodSchema), this.storyController.createStory.bind(this.storyController));
        this.router.get("/getUser", StoryMiddleware(StoryZodSchema), this.storyController.getUserStories.bind(this.storyController));
        this.router.delete("/delete/:userId/:story", StoryMiddleware(DeleteStoryZodSchema), this.storyController.deleteExpiredStories.bind(this.storyController));
        this.router.get("/expire", this.storyController.deleteExpiredStories.bind(this.storyController));
    }
}