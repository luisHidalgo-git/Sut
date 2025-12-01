import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { companies } from '../services/api';
import ImageCropModal from '../components/ImageCropModal';
import '../styles/Profile.css';

const CompanyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    description: '',
    website: '',
    address: '',
    logo_url: '',
    profile_picture: null,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await companies.getMyProfile();
      setProfile(response.data);
      setFormData({
        company_name: response.data.company_name || '',
        industry: response.data.industry || '',
        description: response.data.description || '',
        website: response.data.website || '',
        address: response.data.address || '',
        logo_url: response.data.logo_url || '',
        profile_picture: null,
      });
      setError(null);
    } catch (err) {
      setError('Error al cargar el perfil');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCropSave = (blob) => {
    const file = new File([blob], 'profile_picture.jpg', { type: 'image/jpeg' });
    setFormData((prev) => ({
      ...prev,
      profile_picture: file,
    }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(blob);

    setShowCropModal(false);
    setSelectedImage(null);
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setSelectedImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const submitData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      const response = await companies.updateMyProfile(submitData);
      setProfile(response.data);
      setIsEditing(false);
      setPreviewImage(null);
      setSuccess('Perfil actualizado correctamente');
      setTimeout(() => setSuccess(null), 3000);
      setError(null);
    } catch (err) {
      setError('Error al actualizar el perfil');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getProfilePictureUrl = () => {
    if (previewImage) {
      return previewImage;
    }
    if (profile?.profile_picture) {
      return `http://localhost:8000${profile.profile_picture}`;
    }
    return null;
  };

  const industryChoices = {
    tech: 'Tecnología',
    finance: 'Finanzas',
    healthcare: 'Salud',
    education: 'Educación',
    retail: 'Retail',
    manufacturing: 'Manufactura',
    services: 'Servicios',
    other: 'Otro',
  };

  if (loading && !profile) {
    return <div className="loading">Cargando perfil...</div>;
  }

  return (
    <div className="profile-container">
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <ImageCropModal
        isOpen={showCropModal}
        imageSrc={selectedImage}
        onSave={handleCropSave}
        onCancel={handleCropCancel}
        aspectRatio={1}
      />

      <div className="profile-header">
        <div className="profile-cover"></div>

        <div className="profile-header-content">
          <div className="profile-picture-section">
            {getProfilePictureUrl() ? (
              <img
                src={getProfilePictureUrl()}
                alt="Logo de empresa"
                className="profile-picture"
              />
            ) : (
              <div className="profile-picture-placeholder">🏢</div>
            )}
            {isEditing && (
              <div className="file-input-wrapper">
                <button type="button" className="upload-button" onClick={handleUploadClick}>
                  📷 Cambiar logo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>

          <div className="profile-info">
            <h1 className="profile-name">{profile?.company_name}</h1>
            <p className="profile-email">{user?.email}</p>
            <div className="profile-stats">
              <div className="stat">
                <div className="stat-value">
                  {industryChoices[profile?.industry] || profile?.industry}
                </div>
                <div className="stat-label">Industria</div>
              </div>
              <div className="stat">
                <div className="stat-value">
                  {profile?.is_verified ? '✓ Verificado' : 'No verificado'}
                </div>
                <div className="stat-label">Estado</div>
              </div>
            </div>

            <div className="edit-button-container">
              {!isEditing ? (
                <button className="btn-edit" onClick={() => setIsEditing(true)}>
                  ✏️ Editar perfil
                </button>
              ) : (
                <>
                  <button className="btn-save" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Guardando...' : '✓ Guardar cambios'}
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => {
                      setIsEditing(false);
                      setPreviewImage(null);
                      fetchProfile();
                    }}
                    disabled={loading}
                  >
                    ✕ Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="profile-sections">
        <div className="profile-section">
          <div className="profile-section-title">Información de la Empresa</div>
          <form>
            <div className="form-group">
              <label className="form-label">Nombre de la Empresa</label>
              <input
                type="text"
                name="company_name"
                className="form-input"
                value={formData.company_name}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Industria</label>
              <select
                name="industry"
                className="form-select"
                value={formData.industry}
                onChange={handleInputChange}
                disabled={!isEditing}
              >
                <option value="">Selecciona una industria</option>
                <option value="tech">Tecnología</option>
                <option value="finance">Finanzas</option>
                <option value="healthcare">Salud</option>
                <option value="education">Educación</option>
                <option value="retail">Retail</option>
                <option value="manufacturing">Manufactura</option>
                <option value="services">Servicios</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                name="description"
                className="form-textarea"
                value={formData.description}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Describe tu empresa..."
              />
            </div>
          </form>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">Contacto y Enlaces</div>
          <form>
            <div className="form-group">
              <label className="form-label">Sitio Web</label>
              <input
                type="url"
                name="website"
                className="form-input"
                value={formData.website}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="https://ejemplo.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dirección</label>
              <textarea
                name="address"
                className="form-textarea"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Dirección de la empresa..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Logo URL (opcional)</label>
              <input
                type="url"
                name="logo_url"
                className="form-input"
                value={formData.logo_url}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="https://ejemplo.com/logo.png"
              />
            </div>
          </form>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">Información General</div>
          <div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={user?.email}
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input
                type="tel"
                className="form-input"
                value={user?.phone || ''}
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estado de Verificación</label>
              <input
                type="text"
                className="form-input"
                value={profile?.is_verified ? 'Verificado' : 'Pendiente de verificación'}
                disabled
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
