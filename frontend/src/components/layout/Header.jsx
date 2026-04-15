import React from 'react';
import { Bell, Search } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shadow-sm z-10">
      <div className="flex-1 flex bg-muted/50 rounded-md max-w-md items-center px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
        <Search className="h-4 w-4 text-muted-foreground mr-2" />
        <input
          type="text"
          placeholder="Search patients, orders..."
          className="bg-transparent border-none focus:outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border-2 border-card"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
