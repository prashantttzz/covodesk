import { CreditCardIcon, InboxIcon, LayoutDashboardIcon, LibraryBigIcon, Mic, PaletteIcon } from "lucide-react";

export const sidebarCustomerItems =[
    {
        "title":"Conversations",
        "url":"/conversations",
        "icon": InboxIcon,
    },
    {
        "title":"Knowladge Base",
        "url":"/files",
        "icon": LibraryBigIcon,
    },
]
export const sidebarConfigurationItems =[
    {
        "title":"Widget Customization",
        "url":"/customization",
        "icon": PaletteIcon,
    },
    {
        "title":"Integrations",
        "url":"/integrations",
        "icon": LayoutDashboardIcon,
    },
    {
        "title":"Voice Assistant",
        "url":"/plugins/vapi",
        "icon": Mic,
    },
]
export const sidebarAccountItems = [
    {
        "title":"Plan and Billing",
        url:"billing",
        icon:CreditCardIcon
    }
]

export const STATUS_FILTER_KEY ="echo_status_filter"