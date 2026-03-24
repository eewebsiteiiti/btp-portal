"use client";
import { useRouter, usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FolderKanban,
  ClipboardCheck,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/program-coordinator", icon: LayoutDashboard },
  { label: "Students", path: "/program-coordinator/students", icon: GraduationCap },
  { label: "Projects", path: "/program-coordinator/projects", icon: FolderKanban },
  { label: "Professors", path: "/program-coordinator/professors", icon: Users },
  { label: "Allotted Projects", path: "/program-coordinator/allotedproject", icon: ClipboardCheck },
];

export default function ProgramCoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      <div className="fixed top-0 left-0 h-full w-64 bg-primary text-primary-foreground p-4 flex flex-col shadow-lg">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">PC Panel</h2>
          <p className="text-sm text-primary-foreground/70 mt-1">Program Coordinator</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ label, path, icon: Icon }) => {
            const isActive = pathname === path;
            return (
              <button
                key={path}
                onClick={() => router.push(path)}
                className={cn(
                  "w-full py-3 px-4 text-left rounded-lg transition-all flex items-center gap-3",
                  isActive
                    ? "bg-secondary text-secondary-foreground font-medium"
                    : "hover:bg-primary-foreground/10 text-primary-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-primary-foreground/20">
          <LogoutButton />
        </div>
      </div>

      <div className="ml-64 w-[calc(100%-16rem)] overflow-y-auto p-6 bg-gray-50 min-h-screen">
        {children}
      </div>
    </div>
  );
}
