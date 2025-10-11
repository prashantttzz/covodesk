"use client"
import WidgetHomeScreen from "@/components/widget-homeScreen";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

const PageContent = () => {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId");

  return <WidgetHomeScreen organizationId={organizationId!} />;
};

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
};

export default Page;
