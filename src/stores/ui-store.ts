import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  createIncidentOpen: boolean;
  mobileNavOpen: boolean;
  globalSearch: string;
  toggleSidebar: () => void;
  setCreateIncidentOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  setGlobalSearch: (q: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  createIncidentOpen: false,
  mobileNavOpen: false,
  globalSearch: "",
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setCreateIncidentOpen: (open) => set({ createIncidentOpen: open }),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setGlobalSearch: (q) => set({ globalSearch: q }),
}));
