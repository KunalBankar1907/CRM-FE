import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { isAuthenticated, getRole } from '../utils/auth'


const ProtectedRoute = ({ allowedRoles }) => {
    // Not logged in → login
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />
    }

    // Role not allowed → unauthorized
    if (allowedRoles && !allowedRoles.includes(getRole())) {
        return <Navigate to="/unauthorized" replace />
    }

    return <Outlet />
}

export default ProtectedRoute
