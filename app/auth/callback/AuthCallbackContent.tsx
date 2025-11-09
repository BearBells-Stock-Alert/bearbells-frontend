"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";

export default function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const token = searchParams.get("token");
    const user_id = searchParams.get("user_id");
    const email = searchParams.get("email");
    const name = searchParams.get("name");

    if (token && user_id && email && name) {
      setAuth(token, { id: user_id, email, name });
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify({ id: user_id, email, name }));
      router.push("/dashboard");
    } else {
      router.push("/login?error=invalid_callback");
    }
  }, [searchParams, router, setAuth]);

  return <p className="text-center mt-10">Finalizing login...</p>;
}