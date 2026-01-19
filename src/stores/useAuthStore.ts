import { useContext } from 'react';
import { AuthContext } from './authStore';

export const useAuthStore = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthStore must be used within a AuthProvider');
    }
    return context;
};
