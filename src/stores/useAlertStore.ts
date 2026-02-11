import { create } from 'zustand';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertAction {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
}

interface AlertState {
    isOpen: boolean;
    title: string;
    message: string;
    type: AlertType;
    actions?: AlertAction[];
    showAlert: (message: string, title?: string, type?: AlertType, actions?: AlertAction[]) => void;
    hideAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    actions: undefined,
    showAlert: (message, title = 'NADA Coffee', type = 'info', actions = undefined) => set({
        isOpen: true,
        message,
        title,
        type,
        actions
    }),
    hideAlert: () => set({ isOpen: false, actions: undefined })
}));
