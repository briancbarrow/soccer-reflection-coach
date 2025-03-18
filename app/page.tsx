"use client"
import SimpleChatInterface from "@/components/ui/chat-interface";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";

export default function Home() {
  return (
    <>
      <SimpleChatInterface />

    </>
  );
}
