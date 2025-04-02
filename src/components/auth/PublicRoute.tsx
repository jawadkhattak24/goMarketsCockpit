import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

interface PublicRouteProps {
    children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
    const { isLoggedIn, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isLoggedIn) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default PublicRoute; 