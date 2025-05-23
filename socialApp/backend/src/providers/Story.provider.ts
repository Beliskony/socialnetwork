import { inject, injectable } from "inversify";
import { IStory, IStoryContent } from "../models/Story.model";
import { StoryService } from "../services/Story.service";
import { TYPES } from "../config/TYPES";



@injectable()
export class StoryProvider {
    constructor( @inject(TYPES.StoryService) private storyService: StoryService ) {}

    async createStory(story: {userId: string; content: IStoryContent}): Promise<IStory> {
        const { userId, content } = story
        return this.storyService.createStory(userId, story.content);
    }

    async getUserStories(userId: string): Promise<IStory[]> {
        return this.storyService.getUserStories(userId);
    }

    async deleteExpiredStories(): Promise<void> {
        return this.storyService.deleteExpiredStories();
    }

    async deleteUserStory(storyId: string, userId: string): Promise<void> {
        return this.storyService.deleteUserStory(storyId, userId);
    }
}
