// Interface utilisateur minimal pour peupler la story
interface IUserPopulated {
  _id: string;
  username: string;
  profilePicture?: string;
  // autres champs utiles côté front si besoin
}

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
