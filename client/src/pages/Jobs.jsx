import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobs } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Jobs = () => {
  const [jobsList, setJobsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobs.getAll();
      setJobsList(response.data);
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
        <h1>Oportunidades Laborales</h1>
        {user?.user_type === 'company' && (
          <Link to="/create-job" className="btn btn-primary">
            Publicar Empleo
          </Link>
        )}
      </div>

      <div className="jobs-grid">
        {jobsList.length === 0 ? (
          <p className="no-data">No hay empleos disponibles en este momento.</p>
        ) : (
          jobsList.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <h3>{job.title}</h3>
                <span className="job-type-badge">{getJobTypeLabel(job.job_type)}</span>
              </div>

              <div className="job-company">
                <strong>{job.company.company_name}</strong>
              </div>

              <div className="job-location">
                📍 {job.location}
              </div>

              <p className="job-description">{job.description.substring(0, 150)}...</p>

              {job.salary_min && job.salary_max && (
                <div className="job-salary">
                  💰 ${job.salary_min} - ${job.salary_max}
                </div>
              )}

              <div className="job-footer">
                <span className="job-applications">{job.applications_count} aplicaciones</span>
                <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-small">
                  Ver Detalles
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Jobs;
