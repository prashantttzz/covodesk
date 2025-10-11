"use client"
import { SignUp } from "@clerk/nextjs";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import React from "react";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen min-w-screen h-full w-full items-center justify-center flex flex-col">
      <Authenticated>{children}</Authenticated>
      <AuthLoading>loading...</AuthLoading>
      <Unauthenticated><SignUp/></Unauthenticated>
    </div>
  );
};

export default AuthGuard;
