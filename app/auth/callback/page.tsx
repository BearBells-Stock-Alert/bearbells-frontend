import { Suspense } from "react";
import AuthCallbackContent from "./AuthCallbackContent";

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}