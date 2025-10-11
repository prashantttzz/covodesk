"use client";

import * as React from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
export function Providers({ children }: { children: React.ReactNode }) {
  const client = new ConvexReactClient(
    process.env.NEXT_PUBLIC_CONVEX_URL || ""
  );
  return (
    <ConvexProviderWithClerk useAuth={useAuth} client={client}>
      {children}
    </ConvexProviderWithClerk>
  );
}
