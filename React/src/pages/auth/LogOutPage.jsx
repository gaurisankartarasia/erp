import { useEffect, useContext } from 'react';
import useAuth from '@/hooks/useAuth'; 
import {Spinner} from '@/components/ui/spinner';

const LogOutPage = () => {
  const { logout } = useAuth()


  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <Spinner className="mb-4" />
      <p className="text-lg font-medium">Signing out...</p>
    </div>
  );
};

export default LogOutPage;
