import { Navigate } from 'react-router-dom';
import { nhost } from '../nhost';

export const PrivateRoute = ({ children }) => {
  const session = nhost.auth.getSession();
  if (!session) return <Navigate to="/" />;
  return children;
};

export default PrivateRoute;
