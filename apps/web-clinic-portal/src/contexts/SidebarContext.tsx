/**
 * Sidebar Context
 *
 * Manages sidebar state for the Preclinic-style layout:
 * - Mini sidebar mode (collapsed icons-only view)
 * - Mobile sidebar visibility
 * - Hidden sidebar mode (completely hidden)
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface SidebarContextType {
  /** Whether the sidebar is in mini/collapsed mode (desktop) */
  isMiniSidebar: boolean;
  /** Whether the mobile sidebar is open */
  isSidebarOpen: boolean;
  /** Whether the sidebar is completely hidden */
  isSidebarHidden: boolean;

  /** Toggle between normal and mini sidebar (desktop) */
  toggleMiniSidebar: () => void;
  /** Toggle the sidebar visibility */
  toggleSidebar: () => void;
  /** Open the mobile sidebar */
  openMobileSidebar: () => void;
  /** Close the mobile sidebar */
  closeMobileSidebar: () => void;
  /** Set sidebar hidden state */
  setSidebarHidden: (hidden: boolean) => void;

  // Legacy support for existing components
  leftSidebarCollapsed: boolean;
  rightSidebarOpen: boolean;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setRightSidebarOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const STORAGE_KEY = 'dental-os-mini-sidebar';

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Mini sidebar state (persisted)
  const [isMiniSidebar, setIsMiniSidebar] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  });

  // Mobile sidebar open state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Hidden sidebar state
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);

  // Right sidebar state (for legacy support)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  const toggleMiniSidebar = useCallback(() => {
    setIsMiniSidebar((prev) => {
      const newValue = !prev;
      localStorage.setItem(STORAGE_KEY, String(newValue));
      return newValue;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const openMobileSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const setSidebarHidden = useCallback((hidden: boolean) => {
    setIsSidebarHidden(hidden);
  }, []);

  // Legacy toggles mapped to new functionality
  const toggleLeftSidebar = toggleMiniSidebar;
  const toggleRightSidebar = useCallback(() => {
    setRightSidebarOpen((prev) => !prev);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        // New API
        isMiniSidebar,
        isSidebarOpen,
        isSidebarHidden,
        toggleMiniSidebar,
        toggleSidebar,
        openMobileSidebar,
        closeMobileSidebar,
        setSidebarHidden,

        // Legacy API (for backwards compatibility)
        leftSidebarCollapsed: isMiniSidebar,
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
