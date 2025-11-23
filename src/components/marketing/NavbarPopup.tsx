"use client";

import Link from "next/link";
import { useTranslations } from "next-intl"
import { Button } from "../ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export function NavbarPopup({ backToHome = false }: { backToHome?: boolean }) {
    const t = useTranslations('marketing.navbarPopup');
    const router = useRouter();
    
    return (
        <div className="w-full mb-6 sm:mb-0">
            <div className="container mx-auto">
                <div className="flex items-center justify-between gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => backToHome ? router.push('/') : router.back()}
                        className="flex items-center gap-2 hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('goBack')}</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 hover:bg-muted transition-colors"
                    >
                        <Home className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('home')}</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
