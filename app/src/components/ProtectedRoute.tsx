import { Navigate } from 'react-router-dom';
import { useUser } from './UserContext';
import {JSX} from "react";

interface ProtectedRouteProps {
    children: JSX.Element;
    auth?: string;
}

export const ProtectedRoute = ({ children, auth = "any" }: ProtectedRouteProps) => {
    const { username, authorization } = useUser();

    // If not logged in, redirect to login
    if (!username || !authorization) {
        return <Navigate to="/" replace />;
    }

    // If logged in, but doesn't meet condition of the page, return to profile
    if (username && auth !== "any" && authorization !== auth) {
        return <Navigate to="/dashboard" replace />
    }

    // Otherwise, show the page
    return children;
};

/** This code was written by ChatGPT 4 Turbo. Code has been altered to best fit application by Michael **/
