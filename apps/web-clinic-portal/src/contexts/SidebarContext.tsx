/**
 * Sidebar Context - Collapsible Left & Right Sidebars
 */

import { createContext, useContext, useState, type ReactNode } from 'react';

interface SidebarContextType {
  leftSidebarCollapsed: boolean;
  rightSidebarOpen: boolean;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setRightSidebarOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('dental-os-left-sidebar-collapsed');
    return stored === 'true';
  });

  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  const toggleLeftSidebar = () => {
    setLeftSidebarCollapsed((prev) => {
      const newValue = !prev;
      localStorage.setItem('dental-os-left-sidebar-collapsed', String(newValue));
      return newValue;
    });
  };

  const toggleRightSidebar = () => {
    setRightSidebarOpen((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{
        leftSidebarCollapsed,
        rightSidebarOpen,
        toggleLeftSidebar,
        toggleRightSidebar,
        setRightSidebarOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
}
