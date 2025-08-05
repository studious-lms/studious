"use client";

import { AlertLevel } from "@/lib/alertLevel";
import { addAlert } from "@/store/appSlice";
import { useDispatch } from "react-redux";
import Button from "../../ui/Button";
import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { HiClipboard } from "react-icons/hi";
import type { RouterOutputs } from "@/utils/trpc";
import Skeleton from "../../ui/Skeleton";

type InviteCodeResponse = RouterOutputs['class']['getInviteCode'];

// Skeleton component for the invite code form
const InviteCodeSkeleton = () => (
    <div className="flex flex-col w-[30rem] max-w-full">
        <div className="flex flex-col space-y-3">
            <Skeleton width="6rem" height="1rem" />
            <div className="flex flex-row items-center space-x-2">
                <Skeleton width="12rem" height="2.5rem" />
                <Skeleton width="1.25rem" height="1.25rem" />
            </div>
            <div className="mt-4">
                <Skeleton width="8rem" height="2.5rem" />
            </div>
        </div>
    </div>
);

export default function InviteCode({ classId }: { classId: string }) {
    const [inviteCode, setInviteCode] = useState<string>('');
    const dispatch = useDispatch();

    const createInviteCode = trpc.class.createInviteCode.useMutation({
        onSuccess: (data) => {
            setInviteCode(data.code);
        },
        onError: (error) => {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: error.message || 'Failed to create invite code',
            }));
        }
    });

    const { data: inviteCodeData, isLoading } = trpc.class.getInviteCode.useQuery({ classId });

    useEffect(() => {
        if (inviteCodeData?.code) {
            setInviteCode(inviteCodeData.code);
        }
    }, [inviteCodeData]);

    // Show skeleton loading while fetching invite code
    if (isLoading) {
        return <InviteCodeSkeleton />;
    }

    return (
        <div className="flex flex-col w-[30rem] max-w-full">
            <div className="flex flex-col space-y-3">
                <span className="text-foreground-muted text-sm">Class code</span>
                <span 
                    onClick={() => {
                        navigator.clipboard.writeText(inviteCode);
                        dispatch(addAlert({
                            level: AlertLevel.INFO,
                            remark: 'Copied to clipboard',
                        }));
                    }}
                    className="text-foreground cursor-pointer hover:text-foreground-muted text-4xl font-semibold flex flex-row items-center space-x-2"
                >
                    <span>{inviteCode}</span>
                    <HiClipboard className="size-5" />
                </span>
                <div className="mt-4">
                    <Button.Primary 
                        onClick={() => createInviteCode.mutate({ classId })}
                        isLoading={createInviteCode.isPending}
                    >
                        {createInviteCode.isPending ? 'Regenerating...' : 'Regenerate'}
                    </Button.Primary>
                </div>
            </div>
        </div>
    );
}