"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import bowser from "bowser";
import { useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Button } from "@workspace/ui/components/button";
import { Dicebear } from "@workspace/ui/components/Dicebear";
import { ClockIcon, GlobeIcon, MailIcon, MonitorIcon } from "lucide-react";

type InfoItem = {
  label: string;
  value: string | React.ReactNode;
  className?: string;
};

type InfoSection = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: InfoItem[];
};

const ContactDialog = () => {
  const params = useParams();
  const conversationId = params.conversationId as Id<"conversations"> | null;

  const parseUserAgent = useMemo(() => {
    return (userAgent?: string) => {
      if (!userAgent) return { browser: "Unknown", os: "Unknown", device: "Unknown" };
      const browser = bowser.getParser(userAgent);
      const result = browser.getResult();
      return {
        browser: result.browser.name || "unknown",
        browserVersion: result.browser.version || "unknown",
        os: result.os.name || "unknown",
        osVersion: result.os.version || "",
        device: result.platform.type || "desktop",
        deviceVendor: result.platform.vendor || "",
        deviceModel: result.platform.model || "",
      };
    };
  }, []);

  const contactSession = useQuery(
    api.private.contactsession.getOneByConversationId,
    conversationId ? { conversationId } : "skip"
  );

  const userAgentInfo = useMemo(() => {
    return parseUserAgent(contactSession?.metadata?.userAgent);
  }, [contactSession?.metadata?.userAgent, parseUserAgent]);

  const accordionSections = useMemo<InfoSection[]>(() => {
    if (!contactSession?.metadata) return [];
    return [
      {
        id: "device-info",
        icon: MonitorIcon,
        title: "Device Information",
        items: [
          {
            label: "Browser",
            value:
              userAgentInfo.browser +
              (userAgentInfo.browserVersion ? ` ${userAgentInfo.browserVersion}` : ""),
          },
          { label: "OS", value: userAgentInfo.osVersion || "Unknown" },
          {
            label: "Device",
            value:
              userAgentInfo.deviceModel || userAgentInfo.device || "Unknown",
          },
          { label: "Screen", value: contactSession.metadata.screenResolution },
          { label: "Viewport", value: contactSession.metadata.viewportSize },
          {
            label: "Cookies",
            value: contactSession.metadata.cookieEnabled ? "Enabled" : "Disabled",
          },
        ],
      },
      {
        id: "location-info",
        icon: GlobeIcon,
        title: "Location & Language",
        items: [
          { label: "Language", value: contactSession.metadata.language },
          { label: "Timezone", value: contactSession.metadata.timeZone },
          { label: "UTC Offset", value: contactSession.metadata.timezoneOffset },
        ],
      },
      {
        id: "session-details",
        icon: ClockIcon,
        title: "Session Details",
        items: [
          {
            label: "Session Started",
            value: new Date(contactSession._creationTime).toLocaleString(),
          },
        ],
      },
    ];
  }, [contactSession, userAgentInfo]);

  if (!contactSession) return null;

  return (
    <Dialog >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="glass-light">
          View Contact Info
        </Button>
      </DialogTrigger>

      <DialogContent
        className="
          max-w-lg 
          w-full 
          rounded-2xl 
          border border-white/10 
          bg-[rgba(30,30,30,0.6)] 
          backdrop-blur-md 
          shadow-[0_8px_40px_rgba(0,0,0,0.45)] 
          text-foreground
          "
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dicebear seed={contactSession._id} size={42} />
            <div className="flex flex-col">
              <span className="font-semibold text-lg">{contactSession.name}</span>
              <span className="text-sm text-muted-foreground line-clamp-1">
                {contactSession.email}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <Button asChild className="w-full" size="lg">
            <Link href={`mailto:${contactSession.email}`}>
              <MailIcon className="size-4 mr-2" />
              Send Email
            </Link>
          </Button>

          {accordionSections.length > 0 && (
            <Accordion type="single" collapsible className="rounded-lg border border-white/10">
              {accordionSections.map((section) => (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger className="flex items-center justify-between px-4 py-3 bg-accent/10 hover:bg-accent/20 rounded-t-md text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <section.icon className="size-4 text-muted-foreground" />
                      <span>{section.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-3 text-sm">
                    <div className="space-y-2">
                      {section.items.map((item) => (
                        <div
                          key={`${section.id}-${item.label}`}
                          className="flex justify-between text-foreground/90"
                        >
                          <span>{item.label}</span>
                          <span className={item.className}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;
