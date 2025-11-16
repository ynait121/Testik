'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FolderKanban,
  Workflow,
  FileCode,
  Sparkles,
  Boxes,
  Plug,
  FileArchive,
  Activity,
  Settings,
  Users,
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Workflows', href: '/workflows', icon: Workflow },
  { name: 'DUO IDE', href: '/duo-ide', icon: FileCode },
  { name: 'DARI Builder', href: '/dari-builder', icon: Sparkles },
  { name: 'Templates', href: '/templates', icon: Boxes },
  { name: 'Integrations', href: '/integrations', icon: Plug },
  { name: 'Exports', href: '/exports', icon: FileArchive },
  { name: 'Activity', href: '/activity', icon: Activity },
  { name: 'Admin', href: '/admin', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ open, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'bg-card border-r border-border transition-all duration-300',
        open ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            {open && (
              <span className="font-bold text-lg">AI Platform</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 rounded-lg transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      isActive && 'bg-accent text-accent-foreground',
                      !open && 'justify-center'
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {open && (
                      <span className="ml-3 text-sm font-medium">
                        {item.name}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">U</span>
            </div>
            {open && (
              <div className="ml-3">
                <p className="text-sm font-medium">User</p>
                <p className="text-xs text-muted-foreground">user@example.com</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
