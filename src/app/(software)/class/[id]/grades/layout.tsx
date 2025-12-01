"use client";

import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function GradesLayout({ children }: { children: React.ReactNode }) {
    const appState = useSelector((state: RootState) => state.app);  
    const router = useRouter();
    const pathname = usePathname();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (appState.user.student && pathname !== `/class/${id}/grades/student/${appState.user.id}`) {
            router.push(`/class/${id}/grades/student/${appState.user.id}`);
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [appState.user.student, pathname, id, router]);  

    console.log(loading);
    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-4 h-4 animate-spin" />
            </div>
        );
    }
    return children;
}