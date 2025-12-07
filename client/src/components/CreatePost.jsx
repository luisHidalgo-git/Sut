import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import '../styles/CreatePost.css';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageUrl('');
    fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && !imageUrl) {
      setError('Debes escribir algo o adjuntar una imagen');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const postData = {
        content: content.trim(),
        image_url: imageUrl || null,
      };

      await api.post('/posts/', postData);
      setContent('');
      setImageUrl('');
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
          <div className="avatar">{user.first_name?.charAt(0)}{user.last_name?.charAt(0)}</div>
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

        {imageUrl && (
          <div className="image-preview">
            <img src={imageUrl} alt="Preview" />
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
