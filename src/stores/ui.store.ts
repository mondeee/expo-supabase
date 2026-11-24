import { create } from 'zustand';

type UIState = {
  isDebugPanelOpen: boolean;
  toggleDebugPanel: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  isDebugPanelOpen: false,
  toggleDebugPanel: () => set((state) => ({ isDebugPanelOpen: !state.isDebugPanelOpen }))
}));
