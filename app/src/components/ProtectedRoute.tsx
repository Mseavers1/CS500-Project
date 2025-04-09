import { Navigate } from 'react-router-dom';
import { useUser } from './UserContext';
import {JSX} from "react";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { username } = useUser();

    // If not logged in, redirect to login
    if (!username) {
        return <Navigate to="/" replace />;
    }

    // Otherwise, show the page
    return children;
};
