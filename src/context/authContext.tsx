import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useQuery, QueryObserverResult } from "@tanstack/react-query";

interface AuthContextType {
    isLoggedIn: boolean;
    login: (token: string) => void;
    logout: () => void;
    currentUser: User | null;
    isLoading: boolean;
    refetchUser: () => Promise<QueryObserverResult<User | null, Error>>;
}

export const AuthContext = createContext<AuthContextType>(
    {} as AuthContextType
);

export function useAuth() {
    return useContext(AuthContext);
}

interface User {
    verificationStatus: "UNVERIFIED" | "AUDITING" | "VERIFIED";
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    password: string;
    availableFunds: number;
    uid: string;
}

const fetchUserData = async (): Promise<User | null> => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user/me`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    console.log(response.data.user);
    return response.data.user;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));

    const { data: currentUser, isLoading, refetch: refetchUser } = useQuery<User | null, Error>({
        queryKey: ['userData'],
        queryFn: fetchUserData,
        enabled: !!localStorage.getItem("token"),
        staleTime: 5 * 60 * 1000,
        gcTime: 0,
        retry: 1,
    });

    useEffect(() => {
        if (!isLoading) {
            setIsLoggedIn(!!currentUser);

            if (!currentUser && localStorage.getItem("token")) {
                localStorage.removeItem("token");
            }
        }
    }, [currentUser, isLoading]);

    function login(token: string) {
        localStorage.setItem("token", token);
        setIsLoggedIn(true);
        refetchUser();
    }

    const logout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem("token");
    };

    const value: AuthContextType = {
        isLoggedIn,
        login,
        logout,
        currentUser: currentUser || null,
        isLoading,
        refetchUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
