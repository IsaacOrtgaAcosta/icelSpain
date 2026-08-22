import { createContext, useContext} from 'react';

import type {AuthUser} from '../types';

export type AuthContextValue = {
    user: AuthUser | null;
    setUser: (user: AuthUser | null) => void;
};

export const AuthContext = createContext<AuthContextValue | null> (null)

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);

    if(context === null) {
        throw new Error('useAuth debe utilizarse dentro de AuthProvider');
    }

    return context;
}