import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { students, companies } from '../services/api';
import axios from 'axios';
import '../styles/CreatePost.css';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchProfilePicture();
    }
  }, [user]);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCsrfToken = () => {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && !imageFile) {
      setError('Debes escribir algo o adjuntar una imagen');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const csrfToken = getCsrfToken();

      await axios.post('http://localhost:8000/api/posts/', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(csrfToken && { 'X-CSRFToken': csrfToken }),
        },
      });

      setContent('');
      setImageFile(null);
      setImagePreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      setError('Error al publicar. Intenta de nuevo.');
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="create-post">
      <div className="create-post-header">
        <div className="user-info">
          {profilePictureUrl ? (
            <img
              src={profilePictureUrl}
              alt="Profile"
              className="avatar avatar-img"
            />
          ) : (
            <div className="avatar">{user.first_name?.charAt(0)}{user.last_name?.charAt(0)}</div>
          )}
          <div className="user-details">
            <h4>{user.first_name} {user.last_name}</h4>
            <span className="user-type">{user.user_type === 'student' ? 'Estudiante' : 'Empresa'}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="create-post-form">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="¿Qué estás pensando?"
          className="post-textarea"
          rows="3"
        />

        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" />
            <button
              type="button"
              className="remove-image"
              onClick={removeImage}
              title="Eliminar imagen"
            >
              ✕
            </button>
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        <div className="post-actions">
          <div className="post-options">
            <label className="post-option">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <span title="Añadir foto">📷</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
