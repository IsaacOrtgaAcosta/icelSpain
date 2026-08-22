import {Navigate, Outlet} from 'react-router-dom';

import { useAuth } from '@/app/features/auth/context/auth-context';

export const OwnerRoute = () => {
    const { user } = useAuth();

    if(user?.role !== 'owner') {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};
