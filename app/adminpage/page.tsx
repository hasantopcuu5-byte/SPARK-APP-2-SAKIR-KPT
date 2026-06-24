"use client";

export const runtime = 'edge';

import dynamic from "next/dynamic";

// Uygulamayı sadece Client tarafında (tarayıcıda) çalışmaya zorluyoruz (SSR Kapalı)
const ClientApp = dynamic(() => import("./client-page"), {
  ssr: false,
  loading: () => (
    <div className="min-h-dvh bg-background flex items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-4 border-navy border-t-transparent" />
    </div>
  )
});

export default function Page() {
  return <ClientApp />;
}