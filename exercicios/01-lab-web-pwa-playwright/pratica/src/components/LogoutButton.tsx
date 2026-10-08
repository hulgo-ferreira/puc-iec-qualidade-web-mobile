import { useNavigate } from 'react-router-dom';
import { currentUser, logout } from '@/store/auth';
import { testIDs } from '@/utils/testIDs';

// "Sair": apaga só a SESSÃO (a conta continua guardada) e volta pro login.
export default function LogoutButton() {
  const navigate = useNavigate();
  const name = currentUser()?.name;
  return (
    <button
      className="icon-button"
      data-testid={testIDs.shell.logout}
      title={name ? `Conectado como ${name}` : 'Sair'}
      onClick={() => {
        logout();
        navigate('/login', { replace: true });
      }}
    >
      🚪 Sair
    </button>
  );
}
