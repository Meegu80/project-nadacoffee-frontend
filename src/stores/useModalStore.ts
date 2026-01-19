import { useContext } from 'react';
import { ModalContext } from './ModalStore';

export const useModalStore = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModalStore must be used within a ModalProvider');
    }
    return context;
};
