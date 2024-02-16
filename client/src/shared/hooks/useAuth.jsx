import { useCallback, useState } from "react"

const PREFIX_KEY = 'nexus_code__';

export const useAuth = () => {
    const [user, setUser] = useState(() => {
        return JSON.parse(localStorage.getItem(PREFIX_KEY + 'user'))
    })

    const login = useCallback((userId, token, role = "user") => {
        setUser({ isLoggedIn : true, userId, token, role });
        localStorage.setItem(PREFIX_KEY + 'user', JSON.stringify({ userId, token, role }));
    }, [])

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem(PREFIX_KEY + 'user');
    }, []);

    return { ...user, login, logout }
}