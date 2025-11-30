import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    navigate('/login');
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          JobConnect
        </Link>

        <div className="nav-menu">
          <Link to="/jobs" className="nav-link">Empleos</Link>

          {user ? (
            <>
              {user.user_type === 'student' && (
                <>
                  <Link to="/my-applications" className="nav-link">Mis Aplicaciones</Link>
                  <Link to="/profile" className="nav-link">Mi Perfil</Link>
                </>
              )}

              {user.user_type === 'company' && (
                <>
                  <Link to="/my-jobs" className="nav-link">Mis Empleos</Link>
                  <Link to="/company-profile" className="nav-link">Mi Empresa</Link>
                </>
              )}

              <button onClick={handleLogoutClick} className="btn btn-secondary">
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Iniciar Sesión</Link>
              <Link to="/register" className="btn btn-primary">Registrarse</Link>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Cerrar Sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
        isDangerous={true}
      />
    </nav>
  );
};

export default Navbar;
