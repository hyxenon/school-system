import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/hooks/use-initials';
import { User } from '@/types';

interface UserInfoProps {
    user: User;
    showEmail?: boolean;
}

export function UserInfo({ user, showEmail = false }: UserInfoProps) {
    const initials = getInitials(user?.name);

    return (
        <>
            <Avatar className="h-8 w-8">
                {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                ) : (
                    <AvatarFallback className="bg-secondary text-primary font-medium">{initials}</AvatarFallback>
                )}
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {showEmail && <span className="text-muted-foreground truncate text-xs">{user.email}</span>}
            </div>
        </>
    );
}
