export interface User {
  _id: string;
  username: string;
  email: string;
  profile: {
    fullName?: string;
    bio?: string;
    website?: string;
    location?: string;
    birthDate?: string;
    profilePicture?: string;
    coverPicture?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  };
  contact: {
    phoneNumber?: string;
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  social: {
    followers: string[];
    following: string[];
    friendRequests: string[];
    friends: string[];
    blockedUsers: string[];
    followRequests: string[];
  };
  content: {
    posts: string[];
    stories: string[];
    savedPosts: string[];
    likedPosts: string[];
  };
  preferences: {
    privacy: {
      profile: 'public' | 'friends' | 'private';
      posts: 'public' | 'friends' | 'private';
      friendsList: 'public' | 'friends' | 'private';
    };
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
      newFollower: boolean;
      newMessage: boolean;
      postLikes: boolean;
      postComments: boolean;
    };
    language: string;
    theme: 'light' | 'dark' | 'auto';
  };
  status: {
    isOnline: boolean;
    lastSeen: string;
    isActive: boolean;
    deactivationReason?: string;
    suspendedUntil?: string;
  };
  analytics: {
    postCount: number;
    followerCount: number;
    followingCount: number;
    friendCount: number;
    lastLogin: string;
    loginCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  identifiant: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  profile?: {
    fullName?: string;
    bio?: string;
    location?: string;
    birthDate?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  };
}

export interface UpdateProfileData {
  username?: string;
  email?: string;
  profile?: {
    fullName?: string;
    bio?: string;
    website?: string;
    location?: string;
    birthDate?: string;
    profilePicture?: string;
    coverPicture?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  };
}

export interface PrivacySettings {
  privacy: {
    profile: 'public' | 'friends' | 'private';
    posts: 'public' | 'friends' | 'private';
    friendsList: 'public' | 'friends' | 'private';
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    newFollower: boolean;
    newMessage: boolean;
    postLikes: boolean;
    postComments: boolean;
  };
}

export interface UserState {
  currentUser: User | null;
  token: string | null;
  searchedUsers: User[];
  suggestedUsers: User[];
  blockedUsers: User[];
  loading: boolean;
  error: string | null;
  authLoading: boolean;
}