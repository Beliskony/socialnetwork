

export interface Post {
  _id: string;
  user: string; // ID de l'utilisateur
  text?: string;
  media?: {
    images?: string[];
    videos?: string[];
  };
  createdAt: string;
  updatedAt: string;
}
