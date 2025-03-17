"use client"
import Hero from "@/components/hero";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import SimpleChatInterface from "@/components/ui/chat-interface";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";

export default function Home() {
  return (
    <>
      <SimpleChatInterface />

    </>
  );
}
