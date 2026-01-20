import { Navigate, Outlet } from 'react-router-dom'
// import { useSelector } from 'react-redux'
import { isAuthenticated, getRole } from '../utils/auth'


const PublicRoute = () => {
//   const { isAuthenticated, user } = useSelector((state) => state.auth)

//   if (isAuthenticated) {
//     return user.role === 'owner'
//       ? <Navigate to="/owner/dashboard" replace />
//       : <Navigate to="/employee/dashboard" replace />
//   }
   if (isAuthenticated()) {
    return getRole() === 'owner'
      ? <Navigate to="/owner/dashboard" replace />
      : <Navigate to="/employee/dashboard" replace />
  }

  return <Outlet />
}

export default PublicRoute
