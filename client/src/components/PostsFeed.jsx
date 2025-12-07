import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/PostsFeed.css';

const PostsFeed = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/posts/');
      setPosts(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar las publicaciones');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
      return;
    }

    try {
      await api.delete(`/posts/${postId}/`);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (err) {
      setError('Error al eliminar la publicación');
      console.error('Error deleting post:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace unos momentos';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;

    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getJobTypeLabel = (type) => {
    const types = {
      full_time: 'Tiempo Completo',
      part_time: 'Medio Tiempo',
      internship: 'Prácticas',
      contract: 'Contrato',
    };
    return types[type] || type;
  };

  const renderJobPost = (job) => (
    <div key={`job-${job.id}`} className="post-card job-post-card">
      <div className="post-header">
        <div className="post-author">
          {job.user_profile_picture_url ? (
            <img
              src={job.user_profile_picture_url}
              alt={job.company.company_name}
              className="author-avatar author-avatar-img"
            />
          ) : (
            <div className="author-avatar">
              🏢
            </div>
          )}
          <div className="author-info">
            <h3>{job.company.company_name}</h3>
            <div className="author-meta">
              <span className="author-type">Nueva oportunidad laboral</span>
              <span className="post-time">{formatDate(job.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="post-content job-content">
        <div className="job-post-header">
          <div>
            <h3 className="job-post-title">{job.title}</h3>
            <p className="job-post-location">📍 {job.location}</p>
          </div>
          <span className="job-type-badge-small">{getJobTypeLabel(job.job_type)}</span>
        </div>

        <p className="job-post-description">{job.description}</p>

        {job.salary_min && job.salary_max && (
          <div className="job-post-salary">
            💰 ${job.salary_min} - ${job.salary_max}
          </div>
        )}

        <div className="job-post-footer">
          <span className="job-post-applications">
            {job.applications_count} aplicaciones
          </span>
          <button
            onClick={() => navigate(`/jobs/${job.id}`)}
            className="btn-view-job"
          >
            Ver detalles →
          </button>
        </div>
      </div>
    </div>
  );

  const renderRegularPost = (post) => (
    <div key={`post-${post.id}`} className="post-card">
      <div className="post-header">
        <div className="post-author">
          {post.user_profile_picture_url ? (
            <img
              src={post.user_profile_picture_url}
              alt={post.user_name}
              className="author-avatar author-avatar-img"
            />
          ) : (
            <div className="author-avatar">
              {post.user_name?.charAt(0)}{post.user_name?.split(' ')[1]?.charAt(0)}
            </div>
          )}
          <div className="author-info">
            <h3>{post.user_name}</h3>
            <div className="author-meta">
              <span className="author-type">
                {post.user_type === 'student' ? 'Estudiante' : 'Empresa'}
              </span>
              <span className="post-time">{formatDate(post.created_at)}</span>
            </div>
          </div>
        </div>

        {user && user.id === post.user && (
          <button
            className="delete-btn"
            onClick={() => handleDeletePost(post.id)}
            title="Eliminar publicación"
          >
            ✕
          </button>
        )}
      </div>

      <div className="post-content">
        <p>{post.content}</p>
        {post.image_url && (
          <div className="post-image">
            <img src={post.image_url} alt="Post" />
          </div>
        )}
      </div>
    </div>
  );

  if (loading && posts.length === 0) {
    return <div className="loading">Cargando publicaciones...</div>;
  }

  if (error && posts.length === 0) {
    return <div className="error">{error}</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="no-posts">
        <p>No hay publicaciones aún. ¡Sé el primero en publicar!</p>
      </div>
    );
  }

  return (
    <div className="posts-feed">
      {posts.map((item) => {
        if (item.item_type === 'job') {
          return renderJobPost(item);
        } else {
          return renderRegularPost(item);
        }
      })}
    </div>
  );
};

export default PostsFeed;
