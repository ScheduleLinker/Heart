import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { ArrowDownRightIcon, CirclePlusIcon, DownloadIcon, SettingsIcon, UploadIcon } from "lucide-react";

// *** Menu Items ***
// Here you can add/change/remove sidebar items and how they function.
// For documentation visit https://ui.shadcn.com/docs/components/sidebar
const items = [
    {
        title: "Upload",
        icon: UploadIcon
    },
    {
        title: "Create Bubble",
        icon: CirclePlusIcon
    },
    {
        title: "Create Connection",
        icon: ArrowDownRightIcon
    },
    {
        title: "Download",
        icon: DownloadIcon
    },
    {
        title: "Settings",
        icon: SettingsIcon
    },
]

// *** Sidebar Structure & Function ***
function SidebarComponent() {
    return (
        <div>
            <Sidebar collapsible="icon" className="bg-gray-950">
                <SidebarContent>
                    <SidebarGroup className="text-white">
                        <SidebarGroupLabel className="text-2xl mb-3">Tools</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title} className="mb-2">
                                        <SidebarMenuButton asChild>
                                            <a href="" className="hover:bg-gray-800">
                                                <item.icon/>
                                                <span className="text-lg">{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </div>
    )
}

export default SidebarComponent