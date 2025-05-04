// src/components/SidebarComponent.tsx
import { useRef, useState, ChangeEvent } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { UploadIcon, CirclePlusIcon, SettingsIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

// inside your component…
const navigate = useNavigate();
interface SidebarComponentProps {
  onCreateNode: (name: string, role: "root" | "child") => void;
}

const items = [
  { title: "Upload", icon: UploadIcon, action: "upload" },
  { title: "Create Bubble", icon: CirclePlusIcon, action: "openModal" },
  // { title: "Settings", icon: SettingsIcon, action: () => {} },
];

export default function SidebarComponent({
  onCreateNode,
}: SidebarComponentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<"root" | "child">("child");

  // 1) Trigger hidden file picker
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 2) When an .ics file is selected
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".ics")) {
      alert("Please select an .ics file only.");
      return;
    }

    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const formData = new FormData();
    formData.append("ics_files", file);

    try {
      const response = await fetch(`${API_URL}/api/ics-upload`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      // This is your newly‐parsed calendar (could be object or array)
      const parsed = await response.json();

      // Read existing array (or wrap single) from localStorage
      const raw = localStorage.getItem("parsed-ics");
      let arr: any[] = [];
      if (raw) {
        const existing = JSON.parse(raw);
        arr = Array.isArray(existing) ? existing : [existing];
      }

      // Flatten in the new data
      if (Array.isArray(parsed)) {
        arr.push(...parsed);
      } else {
        arr.push(parsed);
      }

      // Persist and reload so Workspace re‐builds
      localStorage.setItem("parsed-ics", JSON.stringify(arr));
      navigate('/workspace');
    } catch (err) {
      console.error("Upload Button from Sidebar failed:", err);
      alert("Upload failed. Please try again!");
    }
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreateNode(name.trim(), role);
    setName("");
    setRole("child");
    setDialogOpen(false);
  };

  return (
    <>
      <Sidebar collapsible="icon" className="bg-gray-950">
        <SidebarContent>
          <SidebarGroup className="text-white">
            <SidebarGroupLabel className="text-2xl mb-3">
              Tools
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title} className="mb-2">
                    <SidebarMenuButton asChild>
                      {item.action === "upload" ? (
                        <button
                          onClick={handleUploadClick}
                          className="flex w-full items-center gap-2 p-2 hover:bg-gray-800 rounded"
                        >
                          <item.icon />
                          <span className="text-lg">{item.title}</span>
                        </button>
                      ) : item.action === "openModal" ? (
                        <button
                          onClick={() => setDialogOpen(true)}
                          className="flex w-full items-center gap-2 p-2 hover:bg-gray-800 rounded"
                        >
                          <item.icon />
                          <span className="text-lg">{item.title}</span>
                        </button>
                      ) : (
                        <a
                          href="#"
                          className="flex w-full items-center gap-2 p-2 hover:bg-gray-800 rounded"
                        >
                          <item.icon />
                          <span className="text-lg">{item.title}</span>
                        </a>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".ics"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* “Create Bubble” dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create a Bubble!</DialogTitle>
            <DialogDescription>
              Enter a name and pick a role for your new bubble.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Node label"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Role
              </label>
              <select
                className="w-full rounded bg-gray-800 px-3 py-2 text-white"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "root" | "child")
                }
              >
                <option value="root">Root</option>
                <option value="child">Child</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
