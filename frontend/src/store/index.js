import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      activeTrip: null,
      themePalette: 'sunset-amber', // Warm Sunset & Amber

      setAuth: (user, token) => set({ user, token }),
      logout: () => {
        set({ user: null, token: null, activeTrip: null });
        try {
          localStorage.removeItem('globetrotter-storage');
          sessionStorage.clear();
        } catch (e) {}
      },
      setActiveTrip: (trip) => set({ activeTrip: trip }),
      setThemePalette: (palette) => set({ themePalette: palette })
    }),
    {
      name: 'globetrotter-storage',
    }
  )
);

export default useStore;
