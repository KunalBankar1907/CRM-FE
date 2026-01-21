import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { isAuthenticated, getRole } from '../utils/auth'


const ProtectedRoute = ({ allowedRoles }) => {
    // Not logged in → login
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />
    }

    // Role not allowed → unauthorized
    // if (allowedRoles && !allowedRoles.includes(getRole())) {
    //     return <Navigate to="/unauthorized" replace />
    // }
    const role = getRole();
    if (!allowedRoles.includes(role)) {
        const pathParts = location.pathname.split('/').slice(2);
        const subPath = pathParts.join('/');

        const correctBase =
            role === 'owner' ? '/owner' :
                role === 'employee' ? '/employee' :
                    '/'

        const redirectTo = subPath
            ? `${correctBase}/${subPath}`
            : correctBase

        return <Navigate to={redirectTo} replace />
    }

    return <Outlet />
}

export default ProtectedRoute
