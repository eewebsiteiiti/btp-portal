// /app/admin/layout.tsx
"use client";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="flex h-screen">
      {/* Fixed Sidebar */}
      <div className="fixed top-0 left-0 h-full w-64 bg-primary text-secondary p-4 flex flex-col">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        {[
          { label: "Dashboard", path: "/admin" },
          { label: "Uploads", path: "/admin/uploads" },
          { label: "Professors", path: "/admin/professors" },
          { label: "Students", path: "/admin/students" },
          { label: "Projects", path: "/admin/projects" },
          { label: "Alloted Project", path: "/admin/allotedproject" },
        ].map(({ label, path }) => (
          <button
            key={path}
            onClick={() => router.push(path)}
            className="w-full py-2 px-4 mb-2 text-left hover:bg-secondary hover:text-primary rounded transition"
          >
            {label}
          </button>
        ))}
        <div className="mt-auto ">
          <LogoutButton />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="ml-64 w-[calc(100%-16rem)] overflow-y-auto p-6">
        {children}
      </div>
    </div>
  );
}
