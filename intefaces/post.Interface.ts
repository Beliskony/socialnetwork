import { ICommentPopulated, IUserPopulated } from "./comment.Interfaces";

export interface Post {
  _id: string;
  user: IUserPopulated; // ID de l'utilisateur
  text?: string;
  media?: {
    images?: string[];
    videos?: string[];
  };
  comments?: ICommentPopulated[] ;
  createdAt: string;
  updatedAt: string;
}
