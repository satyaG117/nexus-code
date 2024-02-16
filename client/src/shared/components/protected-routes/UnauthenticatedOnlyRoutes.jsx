import { useContext } from "react"
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from "../../contexts/AuthContext";

export default function AuthOnlyRoutes() {
    const auth = useContext(AuthContext);
    // console.log('Unauth only', auth);
    if (!auth.isLoggedIn) {
        return (
            <Outlet />
        )
    } else {
        return (
            <Navigate to="/" />
        )
    }
}