// types/story.types.ts
import { IUserPopulated } from "./comment.Interfaces";

export interface StoryContent {
  type: 'image' | 'video';
  data: string;
}

export interface Story {
  _id: string;
  userId: string;
  content: StoryContent;
  viewedBy: string[];
  createdAt: string;
  expiresAt: string;
}

export interface IStoryPopulated {
  _id: string;
  userId: IUserPopulated;
  content: StoryContent;
  viewedBy: string[];
  createdAt: string;
  expiresAt: string;
  hasViewed?: boolean; // Calculé côté front
  viewsCount?: number; // Calculé côté front
}

export interface StoryState {
  myStories: IStoryPopulated[];
  followingStories: IStoryPopulated[];
  currentStory: IStoryPopulated | null;
  loading: boolean;
  error: string | null;
  viewsLoading: boolean;
  uploadLoading: boolean;
}