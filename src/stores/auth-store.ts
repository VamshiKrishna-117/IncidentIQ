import { create } from "zustand";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  loading: boolean;
  showAuthModal: boolean;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  setAdmin: (isAdmin: boolean) => void;
  setLoading: (loading: boolean) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  showAuthModal: false,
  isAdmin: false,
  setUser: (user) => set({ user, loading: false }),
  setAdmin: (isAdmin) => set({ isAdmin }),
  setLoading: (loading) => set({ loading }),
  openAuthModal: () => set({ showAuthModal: true }),
  closeAuthModal: () => set({ showAuthModal: false }),
}));
