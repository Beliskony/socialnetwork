// Interface utilisateur minimal pour peupler dans le commentaire
export interface IUserPopulated {
  _id: string;
  username: string;
  profilePicture?: string;
  // Ajoute ici d’autres champs utiles que tu souhaites afficher dans le front
}

// Interface commentaire peuplé
export interface ICommentPopulated {
  _id: string;
  user: IUserPopulated;  // objet utilisateur complet (populate)
  post: string;          // ID du post associé
  content: string;
  createdAt: string;     // date en string ISO
  updatedAt: string;
}
