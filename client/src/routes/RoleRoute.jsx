import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Guards a route to only allow users with the matching role.
 * Redirects to their correct dashboard if they access the wrong role path.
 */
const RoleRoute = ({ role, roles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = roles ? [...roles] : (Array.isArray(role) ? [...role] : [role]);
  if (allowedRoles.includes('tpcell') && !allowedRoles.includes('admin')) allowedRoles.push('admin');
  if (allowedRoles.includes('admin') && !allowedRoles.includes('tpcell')) allowedRoles.push('tpcell');

  if (!allowedRoles.includes(user?.role)) {
    // Redirect to the correct dashboard for their role
    const dashMap = {
      student: '/student/dashboard',
      company: '/company/dashboard',
      admin: '/tpcell/dashboard',
      tpcell: '/tpcell/dashboard',
    };
    return <Navigate to={dashMap[user?.role] || '/login'} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
