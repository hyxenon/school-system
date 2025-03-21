import type { User } from '@/types';
import { UserInfo } from '@/components/user-info';

interface SidebarProps {
    user: User;
}

export function Sidebar({ user }: SidebarProps) {
    // Now you can directly use user instead of auth.user
    return (
        <aside className="...">
            <div className="...">
                <UserInfo user={user} />
                {/* ...existing code... */}
            </div>
            <nav>
                {getNavItems(user).map((item) => (
                    // ...existing code...
                ))}
            </nav>
        </aside>
    );
}

function getNavItems(user: User) {
    const role = user.employee ? 'teacher' : 'student';
    // ...rest of your navigation logic...
}