import { create, type StateCreator } from 'zustand';
import { devtools, persist, type PersistOptions } from 'zustand/middleware';

/** User information */
export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

/** App store state */
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sidebarOpen: boolean;
}

/** App store actions */
export interface AppActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  logout: () => void;
}

/** Combined store type */
export type AppStore = AppState & AppActions;

/** Initial state */
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  sidebarOpen: true,
};

/** Persist configuration */
const persistConfig: PersistOptions<
  AppStore,
  Pick<AppState, 'user' | 'isAuthenticated' | 'sidebarOpen'>
> = {
  name: 'app-storage',
  partialize: (state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    sidebarOpen: state.sidebarOpen,
  }),
};

/** Store creator */
const storeCreator: StateCreator<
  AppStore,
  [['zustand/devtools', never], ['zustand/persist', unknown]]
> = (set) => ({
  ...initialState,

  setUser: (user) => set({ user, isAuthenticated: !!user }, false, 'setUser'),

  setLoading: (isLoading) => set({ isLoading }, false, 'setLoading'),

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'toggleSidebar'),

  logout: () => set({ user: null, isAuthenticated: false }, false, 'logout'),
});

/** App store hook */
const useAppStore = create<AppStore>()(
  devtools(persist(storeCreator, persistConfig), { name: 'AppStore' })
);

export default useAppStore;
