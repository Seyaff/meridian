"use client";

import React, { createContext, useContext } from "react";
import { UserType } from "@/types/types";
import { useMe } from "@/hooks/auth/useMe";
import { ApiError } from "@/lib/api/axios-client";

type AuthContextType = {
  user: UserType | null;
  isLoading: boolean;
  isError: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

const AuthContextProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { data, isLoading, isError } = useMe();

  const value: AuthContextType = {
    user: data?.user ?? null,
    isLoading,
    isError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider;

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthContextProvider");
  }

  return context;
};


export const getErrorMessage = (error: any) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong"
  );
};

export const getAuthErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.errorCode === "AUTH_EMAIL_NOT_VERIFIED") {
      return "Please verify your email before signing in.";
    }
    return error.message;
  }
  return "Something went wrong";
};
