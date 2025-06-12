// Interface utilisateur minimal peuplé (optionnel)
interface IUserPopulated {
  _id: string;
  username: string;
  profilePicture?: string;
  // autres champs si besoin
}

// Interface post minimal peuplé (optionnel)
interface IPostPopulated {
  _id: string;
  text?: string;
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
