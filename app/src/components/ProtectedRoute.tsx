import { Navigate } from 'react-router-dom';
import { useUser } from './UserContext';
import {JSX} from "react";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { username, authorization } = useUser();

    // If not logged in, redirect to login
    if (!username || !authorization) {
        return <Navigate to="/" replace />;
    }

    // Otherwise, show the page
    return children;
};

/** This code was written by ChatGPT 4 Turbo. Code has been altered to best fit application **/
