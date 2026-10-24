"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactNode {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-600">
        <AlertTriangle className="h-8 w-8" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-semibold text-ink">কিছু একটা সমস্যা হয়েছে</h1>
      <p className="max-w-md text-sm text-ink-muted">
        কিছুক্ষণ পরে আবার চেষ্টা করুন। সমস্যাটি বারবার হলে যোগাযোগ পাতার মাধ্যমে
        জানান।
      </p>
      <button type="button" onClick={reset} className="btn-primary">
        আবার চেষ্টা করুন
      </button>
    </div>
  );
}
