import React, { createContext, useState, ReactNode } from 'react';

interface ModalContextType {
    isOpen: boolean;
    content: ReactNode | null;
    openModal: (content: ReactNode) => void;
    closeModal: () => void;
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState<ReactNode | null>(null);

    const openModal = (modalContent: ReactNode) => {
        setContent(modalContent);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setContent(null);
    };

    return (
        <ModalContext.Provider value={{ isOpen, content, openModal, closeModal }}>
            {children}
            {/* Simple Portal-like rendering or just inline for now. 
                Ideally this should render the modal UI here or in a separate specific component listening to this store.
            */}
        </ModalContext.Provider>
    );
};
