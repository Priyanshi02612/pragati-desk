import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../app/AppContext';
import { LoginForm } from '../components/forms/LoginForm';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAppContext();

  const handleLogin = (role) => {
    const user = login(role);

    if (user.role === 'Admin') {
      navigate('/admin');
      return;
    }

    if (user.role === 'Team Leader') {
      navigate('/team-leader');
      return;
    }

    navigate('/employee');
  };

  return <LoginForm onLogin={handleLogin} />;
};
