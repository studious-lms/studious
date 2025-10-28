"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { MessageSquare, LogIn } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useTranslations } from 'next-intl';

export default function Chat() {
  const t = useTranslations('chat');
  const appState = useSelector((state: RootState) => state.app);
  const user = appState.user;

  if (!user.loggedIn) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <EmptyState
          icon={LogIn}
          title={t('landing.pleaseSignIn')}
          description={t('landing.signInRequired')}
        />
      </div>
    );
  }

  // Welcome screen when no conversation is selected
  return (
    <div className="h-full bg-background flex items-center justify-center">
      <EmptyState
        icon={MessageSquare}
        title={t('landing.title')}
        description={t('landing.description')}
      />
    </div>
  );
}