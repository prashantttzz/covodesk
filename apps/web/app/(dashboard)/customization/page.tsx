"use client";
import { useQuery } from "convex/react";
import { Loader2Icon } from "lucide-react";
import React from "react";

const WidgetCustomization = () => {
  const widgetSetting = useQuery(api.private.widgetSettings.getOne);

  if (widgetSetting === undefined) {
    return (
      <div className="flex flex-col gap-y-4  min-h-screen items-center justify-center bg-muted p-8">
        <Loader2Icon className="animate-spin text-muted-foreground" />
        <p>Loading widget configurations...</p>
      </div>
    );
  }
  return <div>{JSON.stringify(widgetSetting)}</div>;
};

export default WidgetCustomization;
