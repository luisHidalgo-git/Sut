import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Conecta tu talento con oportunidades</h1>
          <p>La plataforma de empleo que une a estudiantes universitarios con las mejores empresas</p>

          {!user && (
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                Comenzar Ahora
              </Link>
              <Link to="/jobs" className="btn btn-secondary btn-large">
                Ver Empleos
              </Link>
            </div>
          )}

          {user && (
            <div className="hero-actions">
              <Link to="/jobs" className="btn btn-primary btn-large">
                Explorar Oportunidades
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>¿Por qué JobConnect?</h2>
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
    </div>
  );
};

export default Home;
