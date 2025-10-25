// types/comment.types.ts

// ✅ Interface pour la structure réelle de l'API
export interface IAuthor {
  _id: string;
  username: string;
  profile?: {
    profilePicture?: string;
  };
  // Support pour les deux structures
  profilePicture?: string;
}

export interface IReplyPreview {
  _id: string;
  content: {
    text: string;
  };
  author: string | IAuthor; // Peut être ID ou objet peuplé
  createdAt: string;
  engagement: {
    likes: string[];
    likesCount: number;
    replies: string[];
    repliesCount: number;
  };
}

export interface Comment {
  _id: string;
  author: IAuthor; // ✅ Structure corrigée
  post: string;
  parentComment?: string | null;
  content: {
    text: string;
    media?: {
      images?: string[];
      videos?: string[];
    };
  };
  engagement: {
    likes: string[];
    likesCount: number;
    replies: any[]; // ✅ Peut être IDs ou objets partiels
    repliesCount: number;
  };
  metadata: {
    mentions: string[];
    hashtags: string[];
    isEdited: boolean;
    lastEditedAt?: string;
  };
  status: {
    isPublished: boolean;
    isDeleted: boolean;
    deletedAt?: string;
    moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  };
  type: 'comment' | 'reply';
  createdAt: string;
  updatedAt: string;
  id?: string; // ✅ Support pour la transformation
}

export interface ICommentFront {
  _id: string;
  author: IAuthor; // ✅ Même structure que Comment
  post: string;
  parentComment?: {
    _id: string;
    author: IAuthor;
    content: {
      text: string;
      media?: {
        images?: string[];
        videos?: string[];
      };
    };
  } | null;
  content: {
    text: string;
    media?: {
      images?: string[];
      videos?: string[];
    };
  };
  engagement: {
    likes: string[]; // ✅ Reste string[] pour correspondre à l'API
    likesCount: number;
    replies: string[]; // ✅ Reste string[] 
    repliesCount: number;
  };
  metadata: {
    mentions: string[]; // ✅ IDs plutôt que objets peuplés
    hashtags: string[];
    isEdited: boolean;
    lastEditedAt?: string;
  };
  status: {
    isPublished: boolean;
    isDeleted: boolean;
    deletedAt?: string;
    moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  };
  type: 'comment' | 'reply';
  createdAt: string;
  updatedAt: string;
}

export interface CommentState {
  comments: Comment[];
  replies: Comment[];
  popularComments: Comment[];
  currentComment: ICommentFront | null;
  loading: boolean;
  error: string | null;
  repliesLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ✅ Utilitaires pour accéder aux données de manière sécurisée
export const getAuthorProfilePicture = (author: IAuthor): string | null => {
  return author.profile?.profilePicture || author.profilePicture || null;
};

export const getAuthorUsername = (author: IAuthor): string => {
  return author.username || 'Utilisateur inconnu';
};

export const isReplyPreview = (reply: string | IReplyPreview): reply is IReplyPreview => {
  return typeof reply === 'object' && reply !== null && '_id' in reply;
};