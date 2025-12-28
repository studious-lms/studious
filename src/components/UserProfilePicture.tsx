import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function UserProfilePicture({
    profilePicture,
    username,
    size,
}: {
    profilePicture?: string;
    username: string;
    size?: string;
}) {
    return (
        <Avatar className={cn("h-8 w-8 border border-border", size)}>
            <AvatarImage src={profilePicture} />
            <AvatarFallback>
                {username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
        </Avatar>
    )
}

export function GroupProfilePicture({
    users,
}: {
    users: {
        id: string;
        profilePicture?: string;
        username: string;
    }[];
}) {
    // Handle empty users array
    if (users.length === 0) {
        return (
            <Avatar className="h-8 w-8 border border-border flex items-center justify-center">
                <AvatarFallback className="text-xs">?</AvatarFallback>
            </Avatar>
        );
    }

    const totalUsers = users.length;
    const displayUsers = users.slice(0, 3);
    const remainingCount = totalUsers > 3 ? totalUsers - 3 : 0;

    // Handle single user - show centered
    if (totalUsers === 1) {
        return (
            <Avatar className="h-8 w-8 border border-border flex items-center justify-center">
                <UserProfilePicture profilePicture={displayUsers[0]?.profilePicture} username={displayUsers[0]?.username || ""} size="h-6 w-6" />
            </Avatar>
        );
    }

    // Handle two users - show side by side
    if (totalUsers === 2) {
        return (
            <Avatar className="h-8 w-8 border border-border flex items-center justify-center gap-0.5">
                {displayUsers.map(user => (
                    <UserProfilePicture key={user.id} profilePicture={user.profilePicture} username={user.username} size="h-3.5 w-3.5" />
                ))}
            </Avatar>
        );
    }

    // Three or more users - use grid layout
    return (
        <Avatar className="h-8 w-8 border border-border flex flex-col justify-between relative">
            {/* <AvatarImage src={users.map(user => user.profilePicture).join(",")} />
            <AvatarFallback>
                {users.map(user => user.username).join(",")}
            </AvatarFallback> */}
            <div className="flex items-center justify-center">
                <UserProfilePicture profilePicture={displayUsers[0]?.profilePicture} username={displayUsers[0]?.username || ""} size="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between -mt-2">
                {displayUsers.slice(1, 3).map(user => (
                    <UserProfilePicture key={user.id} profilePicture={user.profilePicture} username={user.username} size="h-4 w-4" />
                ))}
                {remainingCount > 0 && (
                    <div className="h-4 w-4 rounded-full bg-muted border border-border flex items-center justify-center text-[8px] font-semibold text-muted-foreground">
                        +{remainingCount}
                    </div>
                )}
            </div>
        </Avatar>
    )
}