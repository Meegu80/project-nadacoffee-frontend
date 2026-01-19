import React, { createContext, useState, ReactNode } from 'react';

interface LayoutContextType {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
}

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    const setSidebarOpen = (isOpen: boolean) => {
        setIsSidebarOpen(isOpen);
    };

    return (
        <LayoutContext.Provider value={{ isSidebarOpen, toggleSidebar, setSidebarOpen }}>
            {children}
        </LayoutContext.Provider>
    );
};
