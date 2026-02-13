export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio: string;
  avatar: string;
  website: string;
  followers: string[];
  following: string[];
  createdAt: string;
  settings: UserSettings;
}

export interface UserSettings {
  privateProfile: boolean;
  showActivity: boolean;
  allowMessages: boolean;
  allowNotifications: boolean;
  emailOnNewFollower: boolean;
  emailOnPinInteraction: boolean;
  theme: 'dark' | 'light';
}

export interface Pin {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  sourceUrl?: string;
  authorId: string;
  boardId?: string;
  tags: string[];
  category: string;
  likes: string[];
  saves: string[];
  comments: Comment[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  pinId: string;
  likes: string[];
  createdAt: string;
}

export interface Board {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  ownerId: string;
  pins: string[];
  followers: string[];
  collaborators: string[];
  isPrivate: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'save' | 'board_invite';
  fromUserId: string;
  toUserId: string;
  pinId?: string;
  boardId?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const CATEGORIES = [
  'All',
  'Fashion',
  'Interior Design',
  'Architecture',
  'Art',
  'Food & Beverage',
  'Photography',
  'Travel',
  'DIY & Crafts',
  'Technology',
  'Nature',
  'Fitness',
  'Beauty',
  'Automotive',
  'Music',
  'Books',
] as const;

export type Category = typeof CATEGORIES[number];

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
