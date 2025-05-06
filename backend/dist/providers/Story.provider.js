var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { inject, injectable } from "inversify";
import { StoryService } from "../services/Story.service";
let StoryProvider = class StoryProvider {
    storyService;
    constructor(storyService) {
        this.storyService = storyService;
    }
    async createStory(story) {
        const { userId, content } = story;
        return this.storyService.createStory(userId, story.content.type, story.content.data);
    }
    async getUserStories(userId) {
        return this.storyService.getUserStories(userId);
    }
    async deleteExpiredStories(storyId) {
        return this.storyService.deleteExpiredStories();
    }
};
StoryProvider = __decorate([
    injectable(),
    __param(0, inject(StoryService)),
    __metadata("design:paramtypes", [StoryService])
], StoryProvider);
export { StoryProvider };
