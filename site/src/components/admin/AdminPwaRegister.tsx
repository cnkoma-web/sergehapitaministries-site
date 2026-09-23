"use client";

import { useEffect } from "react";

export default function AdminPwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/shm-admin-sw.js", { scope: "/admin/" }).catch((error) => {
      console.error("[SHM Admin] Service worker registration failed", error);
    });
  }, []);

  return null;
}
