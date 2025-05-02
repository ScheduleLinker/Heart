import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { ArrowDownRightIcon, CirclePlusIcon, DownloadIcon, SettingsIcon, UploadIcon } from "lucide-react";

// *** Menu Items ***
// Here you can add/change/remove sidebar items and how they function.
// For documentation visit https://ui.shadcn.com/docs/components/sidebar
function SidebarComponent({ onCreateBubble }) {
    const items = [
      {
        title: "Upload",
        icon: UploadIcon,
      },
      {
        title: "Create Bubble",
        icon: CirclePlusIcon,
        onClick: onCreateBubble, //used to give fuctionality when button is pressed
      },
      {
        title: "Create Connection",
        icon: ArrowDownRightIcon,
      },
      {
        title: "Download",
        icon: DownloadIcon,
      },
      {
        title: "Settings",
        icon: SettingsIcon,
      },
    ];
  
    return (
      <Sidebar collapsible="icon" className="bg-gray-950">
        <SidebarContent>
          <SidebarGroup className="text-white">
            <SidebarGroupLabel className="text-2xl mb-3">Tools</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title} className="mb-2">
                    <SidebarMenuButton asChild>
                      <button
                        type="button"
                        onClick={item.onClick}
                        className="hover:bg-gray-800 w-full text-left flex gap-2 items-center px-2 py-1"
                      >
                        <item.icon />
                        <span className="text-lg">{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }
  
  export default SidebarComponent;