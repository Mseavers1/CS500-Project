import React, { createContext, useContext, useState, ReactNode } from 'react';

type UserContextType = {
    username: string | null;
    authorization: string | null;
    setUsername: (username: string | null) => void;
    setAuthorization: (authorization: string | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [username, setUsername] = useState<string | null>(() => {
        return localStorage.getItem('username');
    });

    const [authorization, setAuthorization] = useState<string | null>(() => {
        return localStorage.getItem('authorization');
    });

    return (
        <UserContext.Provider value={{ username, setUsername, authorization, setAuthorization }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

/** Code written by ChatGPT 4-Turbo but edited by Michael for purpose of the project**/
