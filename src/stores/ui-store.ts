import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  createIncidentOpen: boolean;
  mobileNavOpen: boolean;
  toggleSidebar: () => void;
  setCreateIncidentOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  createIncidentOpen: false,
  mobileNavOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setCreateIncidentOpen: (open) => set({ createIncidentOpen: open }),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
}));
