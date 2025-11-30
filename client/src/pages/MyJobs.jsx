import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobs } from '../services/api';

const MyJobs = () => {
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const response = await jobs.getAll();
      setMyJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return <div className="loading">Cargando empleos...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Mis Empleos Publicados</h1>
        <Link to="/create-job" className="btn btn-primary">
          Publicar Nuevo Empleo
        </Link>
      </div>

      {myJobs.length === 0 ? (
        <div className="no-data">
          <p>No has publicado ningún empleo todavía.</p>
          <Link to="/create-job" className="btn btn-primary">
            Publicar Primer Empleo
          </Link>
        </div>
      ) : (
        <div className="jobs-list">
          {myJobs.map((job) => (
            <div key={job.id} className="job-card-horizontal">
              <div className="job-info">
                <div className="job-header">
                  <h3>{job.title}</h3>
                  <span className="job-type-badge">{getJobTypeLabel(job.job_type)}</span>
                </div>
                <p className="job-location">📍 {job.location}</p>
                <p className="job-description">{job.description.substring(0, 120)}...</p>
                <div className="job-stats">
                  <span>📊 {job.applications_count} aplicaciones</span>
                  <span>📅 {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="job-actions">
                <Link to={`/jobs/${job.id}/applications`} className="btn btn-primary">
                  Ver Aplicaciones
                </Link>
                <Link to={`/jobs/${job.id}`} className="btn btn-secondary">
                  Ver Detalles
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyJobs;
