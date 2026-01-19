import { useContext } from 'react';
import { LayoutContext } from './layoutStore';

export const useLayoutStore = () => {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error('useLayoutStore must be used within a LayoutProvider');
    }
    return context;
};
