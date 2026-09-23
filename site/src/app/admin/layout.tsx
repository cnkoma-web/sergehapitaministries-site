import type { Metadata } from "next";
import AdminPwaRegister from "@/components/admin/AdminPwaRegister";

export const metadata: Metadata = {
  title: "SHM Admin",
  manifest: "/admin-manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "SHM Admin",
    statusBarStyle: "default",
  },
};

export const viewport = {
  themeColor: "#4f25d8",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminPwaRegister />
      {children}
    </>
  );
}
