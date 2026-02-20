/* ── DigiGram Pro — Auth Context ── */
"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { api } from "@/lib/api";
import type {
    User,
    UserRole,
    JwtPayload,
    TokenResponse,
    RegisterResponse,
    LoginRequest,
    RegisterRequest,
} from "@/types";

interface AuthContextType {
    user: User | null;
    role: UserRole | null;
    loading: boolean;
    login: (creds: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Safely decode a JWT and return the payload, or null on failure. */
function decodeToken(token: string): JwtPayload | null {
    try {
        const decoded = jwtDecode<JwtPayload>(token);
        // Check expiry
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            return null; // token expired
        }
        return decoded;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);

    /** Fetch the full user profile from /api/auth/me */
    const fetchUser = useCallback(async () => {
        try {
            const me = await api.get<User>("/api/auth/me");
            setUser(me);
            setRole(me.role);
        } catch {
            // Token invalid or expired — clear everything
            localStorage.removeItem("access_token");
            setUser(null);
            setRole(null);
        } finally {
            setLoading(false);
        }
    }, []);

    /** On mount, check for an existing token and hydrate the user */
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            const payload = decodeToken(token);
            if (payload) {
                // Optimistically set role from JWT while we fetch full profile
                setRole(payload.role);
                fetchUser();
            } else {
                // Token invalid or expired
                localStorage.removeItem("access_token");
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [fetchUser]);

    const login = async (creds: LoginRequest) => {
        const response = await api.post<TokenResponse>("/api/auth/login", creds);
        localStorage.setItem("access_token", response.access_token);

        // Decode role from JWT immediately
        const payload = decodeToken(response.access_token);
        if (payload) {
            setRole(payload.role);
        }

        // Fetch full user profile
        await fetchUser();
    };

    const register = async (data: RegisterRequest) => {
        const response = await api.post<RegisterResponse>(
            "/api/auth/register",
            data
        );
        localStorage.setItem("access_token", response.access_token);

        // Set user immediately from register response
        setUser(response.user);
        setRole(response.user.role);
        setLoading(false);
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        setUser(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                role,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
