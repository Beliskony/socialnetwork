import { inject, injectable } from "inversify";
import { IStory, IStoryContent } from "../models/Story.model";
import { StoryService } from "../services/Story.service";



@injectable()
export class StoryProvider {
    constructor( @inject(StoryService) private storyService: StoryService ) {}

    async createStory(story: {userId: string; content: IStoryContent}): Promise<IStory> {
        const { userId, content } = story
        return this.storyService.createStory(userId, story.content.type, story.content.data);
    }

    async getUserStories(userId: string): Promise<IStory[]> {
        return this.storyService.getUserStories(userId);
    }

    async deleteExpiredStories(storyId: string): Promise<void> {
        return this.storyService.deleteExpiredStories();
    }
}
