import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { students } from '../services/api';
import ImageCropModal from '../components/ImageCropModal';
import '../styles/Profile.css';

const StudentProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    university: '',
    career: '',
    semester: '',
    graduation_year: '',
    bio: '',
    skills: '',
    cv_url: '',
    linkedin_url: '',
    profile_picture: null,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await students.getMyProfile();
      setProfile(response.data);
      setFormData({
        university: response.data.university || '',
        career: response.data.career || '',
        semester: response.data.semester || '',
        graduation_year: response.data.graduation_year || '',
        bio: response.data.bio || '',
        skills: response.data.skills || '',
        cv_url: response.data.cv_url || '',
        linkedin_url: response.data.linkedin_url || '',
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

      const response = await students.updateMyProfile(submitData);
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
                alt="Foto de perfil"
                className="profile-picture"
              />
            ) : (
              <div className="profile-picture-placeholder">👤</div>
            )}
            {isEditing && (
              <div className="file-input-wrapper">
                <button className="upload-button">
                  📷 Cambiar foto
                </button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            )}
          </div>

          <div className="profile-info">
            <h1 className="profile-name">
              {user?.first_name} {user?.last_name}
            </h1>
            <p className="profile-email">{user?.email}</p>
            <div className="profile-stats">
              <div className="stat">
                <div className="stat-value">{profile?.career}</div>
                <div className="stat-label">Carrera</div>
              </div>
              <div className="stat">
                <div className="stat-value">{profile?.semester}</div>
                <div className="stat-label">Semestre</div>
              </div>
              <div className="stat">
                <div className="stat-value">{profile?.graduation_year}</div>
                <div className="stat-label">Graduación</div>
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
          <div className="profile-section-title">Información Académica</div>
          <form>
            <div className="form-group">
              <label className="form-label">Universidad</label>
              <input
                type="text"
                name="university"
                className="form-input"
                value={formData.university}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Carrera</label>
              <input
                type="text"
                name="career"
                className="form-input"
                value={formData.career}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Semestre actual</label>
              <input
                type="number"
                name="semester"
                className="form-input"
                value={formData.semester}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Año de Graduación</label>
              <input
                type="number"
                name="graduation_year"
                className="form-input"
                value={formData.graduation_year}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </form>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">Información Personal</div>
          <form>
            <div className="form-group">
              <label className="form-label">Biografía</label>
              <textarea
                name="bio"
                className="form-textarea"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Cuéntanos sobre ti..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Habilidades</label>
              <textarea
                name="skills"
                className="form-textarea"
                value={formData.skills}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Separa tus habilidades con comas..."
              />
            </div>
          </form>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">Links y Referencias</div>
          <form>
            <div className="form-group">
              <label className="form-label">CV (URL)</label>
              <input
                type="url"
                name="cv_url"
                className="form-input"
                value={formData.cv_url}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="https://ejemplo.com/cv.pdf"
              />
            </div>

            <div className="form-group">
              <label className="form-label">LinkedIn</label>
              <input
                type="url"
                name="linkedin_url"
                className="form-input"
                value={formData.linkedin_url}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="https://linkedin.com/in/tu-usuario"
              />
            </div>
          </form>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">Información General</div>
          <div>
            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <input
                type="text"
                className="form-input"
                value={`${user?.first_name} ${user?.last_name}`}
                disabled
              />
            </div>

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
