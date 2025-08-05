import { IUserPopulated, ICommentPopulated } from "./comment.Interfaces";

// Interface post minimal peuplé (optionnel)
interface IPostPopulated {
  _id: string;
  text?: string;
  user: IUserPopulated; // ou directement { _id: string; username: string } si tu populates côté backend
  media?: {
    images?: string[];
    videos?: string[];
  };
  createdAt: string;
  updatedAt: string;
  likes?: string[]; // Type string[] car Mongo renvoie des IDs en string (pas Types.ObjectId)
  comments?: ICommentPopulated[]; // Utilise l'interface
  // autres champs si besoin
}

export interface ILike {
  _id: string;
  userId: string | IUserPopulated;  // id ou objet utilisateur peuplé
  postId: string | IPostPopulated;  // id ou objet post peuplé
  isLiked: boolean;
  createdAt: string;  // Date ISO string
  updatedAt: string;  // Date ISO string
}
