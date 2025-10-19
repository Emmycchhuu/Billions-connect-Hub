"use client";

import dynamic from "next/dynamic";

const VoiceVerification = dynamic(
  () => import("@/components/VoiceVerificationClient"),
  { ssr: false }
);

export default function ClientCommunity({ user, profile }) {
  return <VoiceVerification user={user} profile={profile} />;
}