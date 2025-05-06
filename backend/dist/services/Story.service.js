var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import mongoose from 'mongoose';
import { injectable } from 'inversify';
import StoryModel from '../models/Story.model';
let StoryService = class StoryService {
    async createStory(userId, type, contentUrl) {
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const story = new StoryModel({ userId: new mongoose.Types.ObjectId(userId), type, contentUrl, expiresAt }); // 24h expiration
        return await story.save();
    }
    async getUserStories(userId) {
        const now = new Date();
        return await StoryModel.find({ userId: new mongoose.Types.ObjectId(userId), expiresAt: { $gt: now } }).exec();
    }
    async deleteExpiredStories() {
        const now = new Date();
        await StoryModel.deleteMany({ expiresAt: { $lte: now } }).exec();
    }
};
StoryService = __decorate([
    injectable()
], StoryService);
export { StoryService };
export default new StoryService();
