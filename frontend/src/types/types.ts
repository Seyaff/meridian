export type UserType = {
  id: string;
  email: string;
  username: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  role: string;
  status: string;
  isEmailVerified: boolean;
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  lastSeenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};



export type RegisterRequest = {
  name : string,
  username : string,
  email : string,
  password : string
}


export type VerifyEmailRequest = {
  token: string
}


export type LoginRequest = {
  email : string,
  password : string
}

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  role: string;
  status: string;
  isEmailVerified: boolean;
}

export interface PublicUserProfile {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  isOnline: boolean;
  lastSeenAt?: string;
  createdAt: string;
  isSelf?: boolean;
}

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeenAt?: string;
}

export interface MessageMedia {
  url: string;
  mimeType: string;
  filename: string;
  size: number;
  duration?: number;
}

export interface Conversation {
  id: string;
  slug: string;
  type: "dm" | "group";
  name?: string;
  nickname?: string;
  avatarUrl?: string;
  lastMessage?: {
    messageId: string;
    senderId: string;
    content: string;
    type: string;
    createdAt: string;
  };
  unreadCount: number;
  participants: Array<{
    userId: string;
    role: string;
    name: string;
    username: string;
    avatarUrl?: string;
    lastReadAt?: string;
    nickname?: string;
  }>;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "image" | "file" | "voice";
  media?: MessageMedia;
  clientId?: string;
  createdAt: string;
}
