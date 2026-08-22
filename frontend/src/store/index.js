import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      activeTrip: null,

      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null, activeTrip: null }),
      setActiveTrip: (trip) => set({ activeTrip: trip }),
    }),
    {
      name: 'globetrotter-storage', // saves token/user in localStorage
    }
  )
);

export default useStore;
