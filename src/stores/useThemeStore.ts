import { useContext } from 'react';
import { ThemeContext } from './themeStore';

export const useThemeStore = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeStore must be used within a ThemeProvider');
    }
    return context;
};
