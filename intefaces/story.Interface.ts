import { IUserPopulated } from "./comment.Interfaces";

// Contenu d'une story
interface IStoryContent {
  type: 'image' | 'video';
  data: string;  // URL du média
}

// Story peuplée côté front
export interface IStoryPopulated {
  _id: string;
  userId: IUserPopulated;  // utilisateur peuplé (pas juste l'id)
  content: IStoryContent;
  createdAt: string;  // ISO string date
  expiresAt: string;  // ISO string date
}
