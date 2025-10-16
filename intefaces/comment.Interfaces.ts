// types/comment.types.ts
export interface IUserPopulated {
  _id: string;
  username: string;
  profilePicture?: string;
}

export interface Comment {
  _id: string;
  author: IUserPopulated;
  post: string;
  parentComment?: string;
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
    replies: string[];
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
}

export interface ICommentFront {
  _id: string;
  author: IUserPopulated;
  post: string;
  parentComment?: {
    _id: string;
    author: IUserPopulated;
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
    likes: IUserPopulated[];
    likesCount: number;
    replies: string[];
    repliesCount: number;
  };
  metadata: {
    mentions: IUserPopulated[];
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