"use client";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  BookOpenIcon,
  BotIcon,
  GemIcon,
  LucideIcon,
  MicIcon,
  PaletteIcon,
  PhoneIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface Feature {
  icon: LucideIcon;
  label: string;
  description: string;
}
interface PremiumFeatureOverlay {
  children: React.ReactNode;
}
const features: Feature[] = [
  {
    icon: BotIcon,
    label: "AI customer support",
    description: "intelligence automated 24/7",
  },
  {
    icon: MicIcon,
    label: "AI voicr agent",
    description: "natural voice conversation with customers",
  },
  {
    icon: PhoneIcon,
    label: "Phone system",
    description: "inbound and outbound calling capabilities",
  },
  {
    icon: BookOpenIcon,
    label: "Knowledge base",
    description: "Train ai on your documantation",
  },
  {
    icon: PaletteIcon,
    label: "widget customization",
    description: "customize your chat widget appearance",
  },
];
const PremiumFeatureOverlay = ({ children }: PremiumFeatureOverlay) => {
  const router = useRouter();
  return (
    <div className="relative w-full min-h-screen">
      <div className="pointers-events-none select-none blur-[2px]">
        {children}
      </div>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      <div className="absolute inset-0 z-40 flex items-center justify-center p-4 ">
        <Card className="w-full max-w-md ">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center">
              <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full border bg-muted">
                <GemIcon className="size-6 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-xl">Premium Features</CardTitle>
            <CardDescription>
              this features required pro subsciption
            </CardDescription>
            <CardContent className="space-y-6 ">
              <div className="space-y-6">
                {features.map((feature) => (
                  <div key={feature.label} className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg border bg-muted">
                      <feature.icon />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm">{feature.label}</p>
                      <p className="text-muted-foreground text-xs">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                className="w-full"
                onClick={() => router.push("/billing")}
              >
                View Plans
              </Button>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default PremiumFeatureOverlay;
