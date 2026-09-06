import { Outlet } from 'react-router-dom';

/**
 * Minimal auth layout — Login and Register pages are fully self-contained
 * and handle their own layout/background/branding.
 */
const AuthLayout = () => {
  return <Outlet />;
};

export default AuthLayout;
