import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreatePost from '../components/CreatePost';
import PostsFeed from '../components/PostsFeed';

const Home = () => {
  const { user } = useAuth();
  const [refreshFeed, setRefreshFeed] = useState(0);

  const handlePostCreated = () => {
    setRefreshFeed(prev => prev + 1);
  };

  return (
    <div className="home">
      {!user && (
        <section className="hero">
          <div className="hero-content">
            <h1>Conecta tu talento con oportunidades</h1>
            <p>La plataforma de empleo que une a estudiantes universitarios con las mejores empresas</p>

            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                Comenzar Ahora
              </Link>
            </div>
          </div>
        </section>
      )}

      {user && (
        <section className="feed-section">
          <div className="container feed-container">
            <CreatePost onPostCreated={handlePostCreated} />
            <PostsFeed refreshTrigger={refreshFeed} />
          </div>
        </section>
      )}

      {!user && (
        <section className="features">
          <div className="container">
            <h2>¿Por qué SUT?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🎓</div>
                <h3>Para Estudiantes</h3>
                <p>Encuentra prácticas profesionales, empleos de medio tiempo e inicios de carrera perfectos para ti</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🏢</div>
                <h3>Para Empresas</h3>
                <p>Accede a talento joven y motivado de las mejores universidades</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🚀</div>
                <h3>Proceso Simplificado</h3>
                <p>Aplica con un clic y gestiona todas tus aplicaciones en un solo lugar</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
