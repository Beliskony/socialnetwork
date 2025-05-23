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
import { StoryProvider } from "../providers/Story.provider";
let StoryController = class StoryController {
    storyProvider;
    constructor(storyProvider) {
        this.storyProvider = storyProvider;
    }
    async createStory(req, res) {
        try {
            const { userId, content } = req.body;
            const story = await this.storyProvider.createStory({ userId, content });
            res.status(201).json(story);
        }
        catch (error) {
            console.error("Erreur lors de la création de la story:", error);
            res.status(500).json({ message: "Erreur lors de la création de la story" });
        }
    }
    async getUserStories(req, res) {
        try {
            const { userId } = req.params;
            const stories = await this.storyProvider.getUserStories(userId);
            res.status(200).json(stories);
        }
        catch (error) {
            console.error("Erreur lors de la récupération des stories:", error);
            res.status(500).json({ message: "Erreur lors de la récupération des stories" });
        }
    }
    async deleteExpiredStories(req, res) {
        try {
            const { storyId } = req.params;
            await this.storyProvider.deleteExpiredStories(storyId);
            res.status(204).send();
        }
        catch (error) {
            console.error("Erreur lors de la suppression des stories expirées:", error);
            res.status(500).json({ message: "Erreur lors de la suppression des stories expirées" });
        }
    }
};
StoryController = __decorate([
    injectable(),
    __param(0, inject(StoryProvider)),
    __metadata("design:paramtypes", [StoryProvider])
], StoryController);
export { StoryController };
