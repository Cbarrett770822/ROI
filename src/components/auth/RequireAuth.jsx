import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAuth({ children }) {
  const auth = useSelector(state => state?.auth || {});
  const isLoggedIn = Boolean(auth?.token && auth?.user);
  const location = useLocation();

  if (!isLoggedIn) {
    // Redirect unauthenticated users to login, preserving their intended location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
