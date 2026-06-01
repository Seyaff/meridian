import { LoginRequest, Message, RegisterRequest, UserPresence, VerifyEmailRequest } from "@/types/types";
import API from "./axios-client";

export const getUser = async () => {
  const response = await API.get("/auth/me");
  return response.data;
};

export const refreshToken = async () => {
  const response = await API.post("/auth/refresh");
  return response.data;
};

export const registerUser = async (data: RegisterRequest) => {
  const response = await API.post<{ message: string }>("/auth/register", data);
  return response.data;
};

export const verifyUserEmail = async (data: VerifyEmailRequest) => {
  const res = await API.get("/auth/verify-email", {
    params: data,
  });

  return res.data;
};



export const loginUser = async (data : LoginRequest) => {
  const res = await API.post("/auth/login", data)
  return res.data
}

export const logout = async () => {
  const res = await API.post("/auth/logout")
  return res.data
}



export const listConversations = async () => {
  const res = await API.get("/conversations/all")
  return res.data
}


export const getSingleConversation = async (conversationId :string) => {
  const res = await API.get(`/conversations/conversations/${conversationId}`)
  return res.data
}


export const suggestedUsers = async () => {
  const res = await API.get("/search/suggested-users")
  return res.data.result
}

export const fetchUserByUsername = async (username: string) => {
  const res = await API.get(`/auth/${encodeURIComponent(username)}`)
  return res.data?.data ?? null
}

export const createConversation = async (otherUserId: string) => {
  const res = await API.post("/conversations/create", {
    otherUserId,
  })

  return res.data.conversation
}


export interface SendMessagePayload {
  content?: string;
  type?: "text" | "image" | "file" | "voice";
  media?: any;
  replyToId?: string;
  clientId?: string;
}

export interface ListMessagesQuery {
  limit?: number;
  before?: string; 
}


export async function fetchMessages(conversationId: string, before?: string) {
  const params: Record<string, string> = { limit: "40" };
  if (before) params.before = before;
  const { data } = await API.get(
    `/chat/${conversationId}/list`,
    { params },
  );
  return data as {
    success: boolean;
    messages: Message[];
    hasMore: boolean;
    nextCursor?: string;
  };
}

export async function sendMessage(
  conversationId: string,
  payload: {
    content?: string;
    type?: Message["type"];
    media?: Message["media"];
    clientId?: string;
  },
) {
  const { data } = await API.post(
    `/chat/${conversationId}/send`,
    payload,
  );
  return data.message as Message;
}




export async function fetchPresence(userIds: string[]) {
  if (userIds.length === 0) return [] as UserPresence[];
  const { data } = await API.get("/users/presence", {
    params: { ids: userIds.join(",") },
  });
  return data.presence as UserPresence[];
}



export async function markRead(conversationId: string) {
  const { data } = await API.patch(
    `/conversations/${conversationId}/read`,
  );
  return data;
}
