import { useContext } from "react"
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from "../../contexts/AuthContext";


export default function AuthOnlyRoutes({allowedRoles, redirectTo}) {
    const location = useLocation();
    const auth = useContext(AuthContext);
    // console.log('Auth only : ',auth);
    
    if (auth.isLoggedIn && allowedRoles.includes(auth.role)) {
        return (
            <Outlet />
        )
    } else {
        return (
            <Navigate to={redirectTo} state={{ from: location }} replace />
        )
    }
}