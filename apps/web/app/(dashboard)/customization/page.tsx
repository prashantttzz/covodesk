"use client";
import CustomizationForm from "@/components/CustomizationForm";
import PremiumFeatureOverlay from "@/components/premium-feature-overlay";
import { Protect } from "@clerk/nextjs";
import { api } from "@workspace/backend/_generated/api";
import { useQuery } from "convex/react";
import { Loader2Icon } from "lucide-react";
import React from "react";

const WidgetCustomization = () => {
  const widgetSetting = useQuery(api.private.widgetSetting.getOne);
  const vapiPlugin = useQuery(api.private.plugins.getOne, { service: "vapi" });

  const isLoading = widgetSetting === undefined || vapiPlugin === undefined;
  if (isLoading) {
    return (
      <div className="flex flex-col gap-y-4  min-h-screen items-center justify-center bg-muted p-8">
        <Loader2Icon className="animate-spin text-muted-foreground" />
        <p>Loading widget configurations...</p>
      </div>
    );
  }
  return (
     <Protect
          condition={(has) => has({ plan: "pro" })}
          fallback={<PremiumFeatureOverlay>k </PremiumFeatureOverlay>}
        >
    <div className="flex min-h-screen w-full flex-col bg-muted p-8">
      <div className="max-w-screen-md mx-auto w-full">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl">Widget Customization</h1>
          <p className="text=muted-foreground">
            Customize how your chat widget looks and behave for your customers
          </p>
        </div>
        <div className="mt-8">
          <CustomizationForm initialData={widgetSetting} hasVapiPlugin={!!vapiPlugin}/>
        </div>
      </div>
    </div>
    </Protect>
  );
};

export default WidgetCustomization;
