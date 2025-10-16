import { Button } from "@workspace/ui/components/button";
import {
  ArrowLeftRightIcon,
  LucideIcon,
  PlugIcon,
} from "lucide-react";
import Image from "next/image";
import React from "react";

export interface Feature {
  icon: LucideIcon;
  label: string;
  description: string;
}
interface PluginCardProps {
  isDisabled?: boolean;
  serviceName: string;
  serviceImage: string;
  feature: Feature[];
  onSubmit: () => void;
}
const PluginCard = ({
  isDisabled,
  onSubmit,
  serviceImage,
  serviceName,
  feature,
}: PluginCardProps) => {
  return (
    <div className="h-fit w-full roundedlg bg-background p-8 border">
      <div className="mb-6 flex items-center justify-center gap-6">
        <div className="flex flex-col items-center">
          <Image
            alt={serviceName}
            src={serviceImage}
            height={40}
            width={40}
            className="rounded object-contain"
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <ArrowLeftRightIcon />
        </div>
        <div className="flex flex-col items-center">
          <Image
            alt="plateform"
            src="/logo.svg"
            height={40}
            width={40}
            className="rounded object-contain"
          />
        </div>
      </div>
      <div className="mb-6 text-center">
        <p className="text-lg">connect you {serviceName} account</p>
      </div>
      <div className="mb-6 ">
        <div className="space-y-4">
          {feature.map((feature) => (
            <div className="flex items-center gap-3" key={feature.label}>
              <div className=" flex items-center justify-center rounded-lg border bg-muted size-8">
                <feature.icon className="size4 text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium text-sm">{feature.label}</div>
                <div className="text-muted-foreground text-xs">
                  {feature.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center">
        <Button className="size-full" disabled={isDisabled} onClick={onSubmit}>
          Connect <PlugIcon />
        </Button>
      </div>
    </div>
  );
};

export default PluginCard;
