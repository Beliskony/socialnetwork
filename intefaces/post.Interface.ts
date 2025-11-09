// types/post.types.ts
import { ICommentFront, IAuthor } from "./comment.Interfaces";

export interface Post {
  _id: string;
  user: IAuthor;
  text?: string;
  media?: {
    images?: string[];
    videos?: string[];
  };
  likes?: string[];
  comments?: ICommentFront[];
  createdAt: string;
  updatedAt: string;
}

export interface PostFront {
  _id: string;
  author: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  content: {
    text?: string;
    media: {
      images: {
        url: string;
        thumbnail?: string;
        caption?: string;
        altText?: string;
        width?: number;
        height?: number;
      }[];
      videos: {
        url: string;
        thumbnail?: string;
        duration?: number;
        caption?: string;
        width?: number;
        height?: number;
      }[];
      files: {
        url: string;
        name?: string;
        type?: string;
        size?: number;
      }[];
    };
  };
  engagement: {
    likes: string[];
    likesCount: number;
    comments: string[];
    commentsCount: number;
    shares: string[];
    sharesCount: number;
    saves: string[];
    savesCount: number;
  };
  visibility: {
    privacy: 'public' | 'friends' | 'private' | 'custom';
    allowedUsers: string[];
    isHidden: boolean;
    isArchived: boolean;
  };
  metadata: {
    tags: string[];
    mentions: string[];
    location?: {
      name: string;
      coordinates: {
        latitude: number;
        longitude: number;
      };
    };
    hashtags: string[];
  };
  analytics: {
    views: number;
    viewDuration: number;
    impressions: number;
    reach: number;
    engagementRate: number;
  };
  status: {
    isPublished: boolean;
    isEdited: boolean;
    lastEditedAt?: string;
    isDeleted: boolean;
    deletedAt?: string;
    moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  };
  type: 'text' | 'image' | 'video' | 'poll' | 'event' | 'share';
  poll?: {
    question: string;
    options: {
      text: string;
      votes: string[];
      voteCount: number;
    }[];
    endsAt: string;
    isMultiChoice: boolean;
    totalVotes: number;
  };
  sharedPost?: string;
  createdAt: string;
  updatedAt: string;
}

// État complet pour Redux
export interface PostState {
  // Collections principales
  posts: Post[];                    // Tous les posts
  feed: Post[];                     // Fil d'actualité
  popularPosts: Post[];             // Posts populaires
  savedPosts: Post[];               // Posts sauvegardés
  searchedPosts: Post[];            // Résultats de recherche
  userPosts: Post[] ;                // Posts d'un utilisateur spécifique
  
  // Post actuel (pour la page de détail)
  currentPost: PostFront| null;
  
  // États de chargement
  loading: boolean;                 // Chargement global
  feedLoading: boolean;             // Chargement du feed
  searchLoading: boolean;           // Chargement de la recherche
  userPostsLoading: boolean;        // Chargement des posts utilisateur
  
  // Gestion des erreurs
  error: string | null;
  feedError: string | null;
  searchError: string | null;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Filtres et recherche
  filters: {
    searchQuery: string;
    sortBy: 'recent' | 'popular' | 'trending';
    privacy: 'all' | 'public' | 'friends' | 'private';
    mediaType: 'all' | 'image' | 'video' | 'text';
  };
  
  // Cache et optimisation
  lastFetched: {
    feed: number | null;
    popular: number | null;
    userPosts: number | null;
  };
  
  // Statistiques (optionnel)
  stats: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    engagementRate: number;
  };
}

// États initiaux
export const initialPostState: PostState = {
  posts: [],
  feed: [],
  popularPosts: [],
  savedPosts: [],
  searchedPosts: [],
  userPosts: [],
  currentPost: null,
  
  loading: false,
  feedLoading: false,
  searchLoading: false,
  userPostsLoading: false,
  
  error: null,
  feedError: null,
  searchError: null,
  
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  
  filters: {
    searchQuery: '',
    sortBy: 'recent',
    privacy: 'all',
    mediaType: 'all',
  },
  
  lastFetched: {
    feed: null,
    popular: null,
    userPosts: null,
  },
  
  stats: {
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    engagementRate: 0,
  },
};

// intefaces/post.Interface.ts

// ✅ Fonction createEmptyPostFront déclarée
const createEmptyPostFront = (): any => ({
  _id: 'empty-post-' + Date.now(),
  author: {
    _id: 'unknown-user',
    username: 'Utilisateur inconnu',
    profilePicture: undefined,
  },
  content: {
    text: '',
    media: {
      images: [],
      videos: [],
      files: [],
    },
  },
  engagement: {
    likes: [],
    likesCount: 0,
    comments: [],
    commentsCount: 0,
    shares: [],
    sharesCount: 0,
    saves: [],
    savesCount: 0,
  },
  visibility: {
    privacy: 'public',
    allowedUsers: [],
    isHidden: false,
    isArchived: false,
  },
  metadata: {
    tags: [],
    mentions: [],
    hashtags: [],
  },
  analytics: {
    views: 0,
    viewDuration: 0,
    impressions: 0,
    reach: 0,
    engagementRate: 0,
  },
  status: {
    isPublished: false,
    isEdited: false,
    isDeleted: false,
    moderationStatus: 'pending',
  },
  type: 'text',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const convertToPostFront = (post: any, currentUserId?: string): any => {
  // ✅ VÉRIFICATIONS DE SÉCURITÉ
  if (!post) {
    console.error('❌ Post est undefined dans convertToPostFront');
    return createEmptyPostFront();
  }
 
  // Vérifier la structure du post
  const user = post.user || post.author || {};

  if (!user._id) {
    console.warn('⚠️ Post sans utilisateur valide:', { 
      postId: post._id, 
      hasUser: !!post.user,
      hasAuthor: !!post.author,
      postStructure: Object.keys(post) 
    });
  }

  // ✅ CORRECTION ICI - Gestion sécurisée de profilePicture
  const profilePicture = user.profile?.profilePicture || 
                        user.avatar || 
                        user.profilePicture || 
                        null;

  return {
    _id: post._id || 'unknown-id-' + Date.now(),
    author: {
      _id: user._id || 'unknown-user',
      username: user.username || user.name || 'Utilisateur inconnu',
      profilePicture: profilePicture, // ✅ Utilisation de la variable sécurisée
    },
    content: {
      text: post.text || post.content?.text || '',
      media: {
        images: (post.media?.images || post.content?.media?.images || []).map((url: string) => ({
          url,
          thumbnail: url,
          altText: `Image postée par ${user.username || 'utilisateur'}`,
        })),
        videos: (post.media?.videos || post.content?.media?.videos || []).map((url: string) => ({
          url,
          thumbnail: url.replace('.mp4', '.jpg'),
        })),
        files: [],
      },
    },
    engagement: {
      likes: post.likes || post.engagement?.likes || [],
      likesCount: post.likes?.length || post.engagement?.likesCount || 0,
      comments: post.comments?.map((c: any) => c._id).filter(Boolean) || post.engagement?.comments || [],
      commentsCount: post.comments?.length || post.engagement?.commentsCount || 0,
      shares: post.engagement?.shares || [],
      sharesCount: post.engagement?.sharesCount || 0,
      saves: post.engagement?.saves || [],
      savesCount: post.engagement?.savesCount || 0,
    },
    visibility: {
      privacy: post.visibility?.privacy || 'public',
      allowedUsers: post.visibility?.allowedUsers || [],
      isHidden: post.visibility?.isHidden || false,
      isArchived: post.visibility?.isArchived || false,
    },
    metadata: {
      tags: post.metadata?.tags || [],
      mentions: post.metadata?.mentions || [],
      hashtags: post.metadata?.hashtags || [],
    },
    analytics: {
      views: post.analytics?.views || 0,
      viewDuration: post.analytics?.viewDuration || 0,
      impressions: post.analytics?.impressions || 0,
      reach: post.analytics?.reach || 0,
      engagementRate: post.analytics?.engagementRate || 0,
    },
    status: {
      isPublished: post.status?.isPublished !== false,
      isEdited: post.status?.isEdited || (post.createdAt !== post.updatedAt),
      lastEditedAt: post.status?.lastEditedAt || (post.createdAt !== post.updatedAt ? post.updatedAt : undefined),
      isDeleted: post.status?.isDeleted || false,
      moderationStatus: post.status?.moderationStatus || 'approved',
    },
    type: post.type || 'text',
    createdAt: post.createdAt || new Date().toISOString(),
    updatedAt: post.updatedAt || new Date().toISOString(),
  };
};

// Fonctions utilitaires
const extractMentions = (text: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const matches = text.match(mentionRegex);
  return matches ? matches.map(m => m.substring(1)) : [];
};

const extractHashtags = (text: string): string[] => {
  const hashtagRegex = /#(\w+)/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(m => m.substring(1)) : [];
};

const determinePostType = (post: Post): PostFront['type'] => {
  if (post.media?.videos && post.media.videos.length > 0) return 'video';
  if (post.media?.images && post.media.images.length > 0) return 'image';
  if (post.text && post.text.length > 0) return 'text';
  return 'text';
};