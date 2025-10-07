import { ICommentPopulated, IUserPopulated } from "./comment.Interfaces";

export interface Post {
  _id: string;
  user: IUserPopulated; // ID de l'utilisateur
  text?: string;
  media?: {
    images?: string[];
    videos?: string[];
  };
  likes?: string[]; // IDs des utilisateurs qui ont liké le post
  comments?: ICommentPopulated[] ;
  createdAt: string;
  updatedAt: string;
}
