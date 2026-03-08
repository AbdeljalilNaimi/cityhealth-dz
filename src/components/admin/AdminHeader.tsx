import { useState } from 'react';
import { Bell, Search, User, Settings, LogOut, CheckCheck, Flag, UserPlus, Shield, Megaphone, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminRealtimeNotifications, type RealtimeEvent } from '@/hooks/useAdminRealtimeNotifications';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AdminHeaderProps {
  title: string;
  notificationCount?: number;
}

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  new_registration: <UserPlus className="h-4 w-4 text-blue-500" />,
  new_report_provider: <Flag className="h-4 w-4 text-destructive" />,
  new_report_ad: <Megaphone className="h-4 w-4 text-amber-500" />,
  new_report_community: <MessageSquare className="h-4 w-4 text-orange-500" />,
  firestore_notification: <Bell className="h-4 w-4 text-primary" />,
  verification_revoked: <Shield className="h-4 w-4 text-destructive" />,
  verification_submitted: <Shield className="h-4 w-4 text-green-500" />,
};

function NotificationItem({ notification, onRead }: { notification: RealtimeEvent; onRead: () => void }) {
  const icon = NOTIFICATION_ICONS[notification.type] || <Bell className="h-4 w-4 text-muted-foreground" />;
  const timeAgo = formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: fr });

  return (
    <button
      onClick={onRead}
      className={`w-full flex items-start gap-3 p-3 text-left transition-colors hover:bg-muted/50 rounded-lg ${
        !notification.isRead ? 'bg-primary/5' : ''
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-foreground truncate`}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.message}</p>
        <p className="text-xs text-muted-foreground/70 mt-1">{timeAgo}</p>
      </div>
      {!notification.isRead && (
        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
      )}
    </button>
  );
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useAdminRealtimeNotifications();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('admin', 'searchPlaceholder')}
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell with Dropdown */}
          <Popover open={notifOpen} onOpenChange={setNotifOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 text-xs animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <p className="text-xs text-muted-foreground">{unreadCount} non lue(s)</p>
                </div>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={markAllAsRead}>
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Tout marquer lu
                  </Button>
                )}
              </div>
              <ScrollArea className="max-h-[400px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-sm">Aucune notification</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {notifications.map((notif) => (
                      <NotificationItem
                        key={notif.id}
                        notification={notif}
                        onRead={() => markAsRead(notif.id, notif.source)}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.email?.split('@')[0] || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || 'admin@example.com'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/admin/profile')}>
                <User className="mr-2 h-4 w-4" />
                {t('admin', 'myProfile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                <Settings className="mr-2 h-4 w-4" />
                {t('admin', 'settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                {t('admin', 'logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
