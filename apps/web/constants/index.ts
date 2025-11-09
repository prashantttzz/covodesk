import {
  CreditCardIcon,
  InboxIcon,
  LayoutDashboardIcon,
  LibraryBigIcon,
  Mic,
  PaletteIcon,
} from "lucide-react";

export const sidebarCustomerItems = [
  {
    title: "Conversations",
    url: "/conversations",
    icon: InboxIcon,
  },
  {
    title: "Knowladge Base",
    url: "/files",
    icon: LibraryBigIcon,
  },
];
export const sidebarConfigurationItems = [
  {
    title: "Widget Customization",
    url: "/customization",
    icon: PaletteIcon,
  },
  {
    title: "Integrations",
    url: "/integrations",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Voice Assistant",
    url: "/plugins/vapi",
    icon: Mic,
  },
];
export const sidebarAccountItems = [
  {
    title: "Plan and Billing",
    url: "billing",
    icon: CreditCardIcon,
  },
];

export const STATUS_FILTER_KEY = "echo_status_filter";

export const INTEGRATION = [
  {
    id: "html",
    title: "HTML",
    icon: "/languages/html5.svg",
  },
  {
    id: "react",
    title: "React",
    icon: "/languages/react.svg",
  },
  {
    id: "nextjs",
    title: "Next.js",
    icon: "/languages/nextjs.svg",
  },
  {
    id: "javascript",
    title: "Javascript",
    icon: "/languages/javascript.svg",
  },
];

export type integrationId = (typeof INTEGRATION)[number]["id"];
export const HTML_SCRIPT = `<script src="https://convodesk-widget.pages.dev/widget.js" data-organization-id="YOUR_ORG_ID"></script>`;

export const REACT_SCRIPT = `
import { useEffect } from "react";
export default function EchoWidget({ organizationId }) {
  useEffect(() => {
    if (document.getElementById("echo-widget-script")) return;
    const s = document.createElement("script");
    s.id = "echo-widget-script";
    s.src = "https://convodesk-widget.pages.dev/widget.js";
    s.async = true;
    s.setAttribute("data-organization-id", organizationId);
    document.body.appendChild(s);
    return () => s.remove();
  }, [organizationId]);
  return null;
}`;

export const NEXTJS_SCRIPT= `
"use client";
import { useEffect } from "react";
export function EchoWidget({ organizationId }) {
  useEffect(() => {
    if (document.getElementById("echo-widget-script")) return;
    const s = document.createElement("script");
    s.id = "echo-widget-script";
    s.src = "https://convodesk-widget.pages.dev/widget.js";
    s.async = true;
    s.setAttribute("data-organization-id", organizationId);
    document.body.appendChild(s);
    return () => s.remove();
  }, [organizationId]);
}
`;

export const JAVASCRIPT_SCRIPT = `
(function () {
  if (document.getElementById("echo-widget-script")) return;
  var s = document.createElement("script");
  s.id = "echo-widget-script";
  s.src = "https://convodesk-widget.pages.dev/widget.js";
  s.async = true;
  s.setAttribute("data-organization-id", "YOUR_ORG_ID");
  document.body.appendChild(s);
})();
`;
