"use client"
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import bowser from "bowser";
import { Dicebear } from "@workspace/ui/components/Dicebear";
import { useQuery } from "convex/react";
import { ClockIcon, GlobeIcon, MailIcon, MonitorIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import React, { useMemo } from "react";

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
const ContactPanel = () => {
  const params = useParams();
  const conversationId = params.conversationId as Id<"conversations"> | null;
  const parseUserAgent = useMemo(() => {
    return (userAgent?: string) => {
      if (!userAgent) {
        return { browser: "Unknown", os: "Unknown", device: "unknown" };
      }
      const browser = bowser.getParser(userAgent);
      const result = browser.getResult();
      return {
        browser: result.browser.name || "unknown",
        browserVersion: result.browser.version || "unknown",
        os: result.browser.name || "unknown",
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
    if (!contactSession?.metadata) {
      return [];
    }
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
              (userAgentInfo.browserVersion
                ? `${userAgentInfo.browserVersion}`
                : ""),
          },
          {
            label: "OS",
            value: userAgentInfo.osVersion ? `${userAgentInfo.osVersion}` : "",
          },
          {
            label: "Device",
            value:
              userAgentInfo.device + userAgentInfo.deviceModel
                ? `${userAgentInfo.deviceModel}`
                : "",
          },
          { label: "screen", value: contactSession.metadata.screenResolution },
          { label: "viewport", value: contactSession.metadata.viewportSize },
          {
            label: "Cookies",
            value: contactSession.metadata.cookieEnabled
              ? "Enabled"
              : "Disabled",
          },
        ],
      },
      {
        id: "location-info",
        icon: GlobeIcon,
        title: "Location and language",
        items: [
          { label: "Language", value: contactSession.metadata.language },
          { label: "Timezone", value: contactSession.metadata.timeZone },
          {
            label: "UTF offset",
            value: contactSession.metadata.timezoneOffset,
          },
        ],
      },
      {
        id: "session-details",
        title: "Session details",
        icon: ClockIcon,
        items: [
          {
            label: "Session started",
            value: new Date(contactSession._creationTime).toLocaleString(),
          },
        ],
      },
    ];
  }, [contactSession, userAgentInfo]);

  if (contactSession === undefined || contactSession === null) {
    return null;
  }
  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground">
      <div className="flex flex-col gap-y-4 p-4">
        <div className="flex items-center gap-x-2">
          <Dicebear
            badgeUrl=""
            imageUrl=""
            seed={contactSession._id}
            size={42}
          />
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-x-2">
              <h4 className="line-clamp-1">{contactSession.name}</h4>
            </div>
            <p className="line-clamp-1 text-muted-foreground text-sm">
              {contactSession.email}
            </p>
          </div>
        </div>
        <Button asChild className="w-full" size="lg">
          <Link href={`mailto:${contactSession.email}`}>
            <MailIcon />
            <span>send email</span>
          </Link>
        </Button>
      </div>
      <div>
        {contactSession.metadata && (
          <Accordion
            className="w-full rounded-none border-y"
            collapsible
            type="single"
          >
            {accordionSections.map((section) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="rounded-none outline-none has-focus-visible:z-10 has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
              >
                <AccordionTrigger className="flex w-full flex-1 items-start justify-between gap-4 rounded-none bg-accent px-5 py-4 text-left font-medium text-sm outline-none transition-all hover:no-underline disabled:pointer-events-none disabled:opacity-50">
                  <div className="flex items-center gap-4">
                    <section.icon className="size-4 shrink-0" />
                    <span>{section.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 py-4">
                  <div className="space-y-2 text-sm">
                    {section.items.map((item) => (
                      <div
                        className="flex  justify-between"
                        key={`${section.id}-${item.label}`}
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
    </div>
  );
};

export default ContactPanel;
