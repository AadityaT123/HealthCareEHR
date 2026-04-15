import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  FileText,
  Activity,
  Pill,
  Settings,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '../ui';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Patients', path: '/patients', icon: Users },
  { name: 'Documentation', path: '/documentation', icon: FileText },
  { name: 'Orders', path: '/orders', icon: Activity },
  { name: 'Medications', path: '/medications', icon: Pill },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = () => {
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full shadow-sm transition-all duration-300">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
          HealthCare EHR
        </h1>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors group',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            DR
          </div>
          <div className="ml-3 truncate">
            <p className="text-sm font-medium text-foreground truncate">Staff User</p>
            <p className="text-xs text-muted-foreground truncate">Clinical Lead</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
