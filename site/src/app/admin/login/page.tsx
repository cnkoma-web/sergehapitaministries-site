import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Connexion admin", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <div className="admin-shell">
      <div className="admin-login-wrap">
        <h1 style={{ fontSize: 22, marginBottom: 24, textAlign: "center" }}>Administration</h1>
        <LoginForm />
      </div>
    </div>
  );
}
