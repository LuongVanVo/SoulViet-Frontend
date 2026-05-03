import { create } from 'zustand';
import type { HubConnection } from '@microsoft/signalr';

interface SignalRState {
    connection: HubConnection | null;
    setConnection: (connection: HubConnection | null) => void;
}

export const useSignalRStore = create<SignalRState>((set) => ({
    connection: null,
    setConnection: (connection) => set({ connection }),
}));
