import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  Shield,
  Megaphone,
  Users,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Flag,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  User,
  BookOpen,
  CalendarDays,
  Code,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  title: string;
  icon: React.ElementType;
  href?: string;
  tabValue?: string;
}

const navItems: NavItem[] = [
  { title: 'Tableau de bord', icon: LayoutDashboard, tabValue: 'overview' },
  { title: 'Inscriptions', icon: UserPlus, tabValue: 'inscriptions' },
  { title: 'Vérifications', icon: Shield, tabValue: 'verifications' },
  { title: 'Annonces', icon: Megaphone, tabValue: 'ads' },
  { title: 'Utilisateurs', icon: Users, tabValue: 'users' },
  { title: 'Analytiques', icon: BarChart3, tabValue: 'analytics' },
  { title: 'Journal d\'audit', icon: FileText, tabValue: 'audit' },
  
  { title: 'Signalements', icon: Flag, tabValue: 'reports' },
  { title: 'Configuration', icon: Settings, tabValue: 'settings' },
  { title: 'Documentation IA', icon: BookOpen, tabValue: 'documentation' },
  { title: 'Gestion API', icon: Code, tabValue: 'api' },
];

interface AdminSidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminSidebar({ currentTab, onTabChange }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const handleProfileClick = () => {
    navigate('/admin/profile');
  };

  return (
    <aside
      className={cn(
        'flex flex-col bg-card border-r border-border transition-all duration-300 h-screen sticky top-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Admin Panel</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.tabValue;
          const Icon = item.icon;

          const button = (
            <button
              key={item.tabValue}
              onClick={() => onTabChange(item.tabValue!)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
            </button>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.tabValue} delayDuration={0}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.title}
                </TooltipContent>
              </Tooltip>
            );
          }

          return button;
        })}
      </nav>

      {/* Footer - Admin Profile */}
      <div className="border-t border-border p-3">
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors',
            collapsed && 'justify-center'
          )}
          onClick={handleProfileClick}
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.email?.split('@')[0] || 'Admin'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || 'admin@example.com'}
              </p>
            </div>
          )}
        </div>

        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={collapsed ? 'icon' : 'default'}
              onClick={handleLogout}
              className={cn(
                'w-full mt-2 text-destructive hover:text-destructive hover:bg-destructive/10',
                collapsed && 'h-9 w-9'
              )}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span className="ml-2">Déconnexion</span>}
            </Button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right">Déconnexion</TooltipContent>
          )}
        </Tooltip>
      </div>
    </aside>
  );
}
