"use client";

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { trpc } from '@/utils/trpc';
import { setAuth } from '@/store/appSlice';
import { useNavigation, ROUTES } from '@/lib/navigation';
import Dropdown, { DropdownItem } from './Dropdown';
import ProfilePicture from './ProfilePicture';
import Button from './Button';

interface UserProfileProps {
    username: string;
    className?: string;
}

export default function UserProfile({ username, className = '' }: UserProfileProps) {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [isSigningOut, setIsSigningOut] = useState(false);

    const logoutMutation = trpc.auth.logout.useMutation({
        onSuccess: () => {
            dispatch(setAuth({
                loggedIn: false,
                teacher: false,
                student: false,
                institutionIds: [],
            }));
            navigation.push(ROUTES.LOGIN);
        },
        onError: (error) => {
            console.error('Logout error:', error);
            setIsSigningOut(false);
        }
    });

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            await logoutMutation.mutateAsync();
        } catch (error) {
            console.error('Failed to sign out:', error);
            setIsSigningOut(false);
        }
    };

    const dropdownItems: DropdownItem[] = [
        {
            label: 'Profile',
            onClick: () => {
                // TODO: Navigate to profile page
                console.log('Navigate to profile');
            }
        },
        {
            label: 'Settings',
            onClick: () => {
                // TODO: Navigate to settings page
                console.log('Navigate to settings');
            }
        },
        {
            label: 'Sign Out',
            onClick: handleSignOut,
            disabled: isSigningOut
        }
    ];

    const trigger = (
        <Button.SM>
            <ProfilePicture username={username} size="sm" />
        </Button.SM>
    );

    return (
        <div className={className}>
            <Dropdown 
                trigger={trigger}
                items={dropdownItems}
                orientation="top"
                align="left"
                className="w-full flex items-center justify-center"
            />
        </div>
    );
} 