import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { students, companies } from '../services/api';
import ConfirmModal from './ConfirmModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchProfilePicture();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const fetchProfilePicture = async () => {
    try {
      if (user.user_type === 'student') {
        const response = await students.getMyProfile();
        setProfilePictureUrl(response.data.profile_picture_url);
      } else if (user.user_type === 'company') {
        const response = await companies.getMyProfile();
        setProfilePictureUrl(response.data.profile_picture_url);
      }
    } catch (err) {
      console.error('Error fetching profile picture:', err);
    }
  };

  const handleLogoutClick = () => {
    setShowDropdown(false);
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

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const getProfileLink = () => {
    return user.user_type === 'student' ? '/profile/student' : '/profile/company';
  };

  const getProfileLabel = () => {
    return user.user_type === 'student' ? 'Mi Perfil' : 'Mi Empresa';
  };

  const getUserInitials = () => {
    if (!user) return '';
    const firstInitial = user.first_name?.charAt(0) || '';
    const lastInitial = user.last_name?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          SUT
        </Link>

        <div className="nav-menu">
          {user && <Link to="/jobs" className="nav-link">Empleos</Link>}

          {user ? (
            <>
              {user.user_type === 'student' && (
                <Link to="/my-applications" className="nav-link">Mis Aplicaciones</Link>
              )}

              {user.user_type === 'company' && (
                <Link to="/my-jobs" className="nav-link">Mis Empleos</Link>
              )}

              <div className="profile-dropdown" ref={dropdownRef}>
                <button onClick={toggleDropdown} className="profile-button">
                  {profilePictureUrl ? (
                    <img src={profilePictureUrl} alt="Perfil" className="profile-avatar" />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      {getUserInitials()}
                    </div>
                  )}
                </button>

                {showDropdown && (
                  <div className="dropdown-menu">
                    <Link
                      to={getProfileLink()}
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      {getProfileLabel()}
                    </Link>
                    <button
                      onClick={handleLogoutClick}
                      className="dropdown-item dropdown-item-logout"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
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
