import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile } from '@/types'

interface AuthState {
  user: UserProfile | null
  isLoggedIn: boolean
  isLoading: boolean

  setUser: (user: UserProfile | null) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      isLoading: true,

      setUser: (user) =>
        set({ user, isLoggedIn: Boolean(user), isLoading: false }),

      logout: () =>
        set({ user: null, isLoggedIn: false }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)