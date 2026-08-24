import { create } from 'zustand';

interface LoadingState {
  pendingRequests: number;
  startRequest: () => void;
  finishRequest: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  pendingRequests: 0,
  startRequest: () => set((state) => ({ pendingRequests: state.pendingRequests + 1 })),
  finishRequest: () => set((state) => ({ pendingRequests: Math.max(0, state.pendingRequests - 1) })),
}));
