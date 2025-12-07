import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { jobs } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Jobs = () => {
  const [jobsList, setJobsList] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      filterJobs(searchTerm);
    } else {
      setFilteredJobs(jobsList);
    }
  }, [searchTerm, jobsList]);

  const fetchJobs = async () => {
    try {
      const response = await jobs.getAll();
      setJobsList(response.data);
      setFilteredJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = (term) => {
    const lowerTerm = term.toLowerCase();
    const filtered = jobsList.filter((job) => {
      return (
        job.title.toLowerCase().includes(lowerTerm) ||
        job.description.toLowerCase().includes(lowerTerm) ||
        job.location.toLowerCase().includes(lowerTerm) ||
        job.company.company_name.toLowerCase().includes(lowerTerm) ||
        job.requirements.toLowerCase().includes(lowerTerm) ||
        job.responsibilities.toLowerCase().includes(lowerTerm)
      );
    });
    setFilteredJobs(filtered);
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
        <div>
          <h1>Oportunidades Laborales</h1>
          {searchTerm && (
            <p className="subtitle">
              {filteredJobs.length} resultado{filteredJobs.length !== 1 ? 's' : ''} para "{searchTerm}"
            </p>
          )}
        </div>
        {user?.user_type === 'company' && (
          <Link to="/create-job" className="btn btn-primary">
            Publicar Empleo
          </Link>
        )}
      </div>

      <div className="jobs-grid">
        {filteredJobs.length === 0 ? (
          <div className="no-data">
            {searchTerm ? (
              <>
                <p>No se encontraron empleos que coincidan con "{searchTerm}"</p>
                <Link to="/jobs" className="btn btn-primary">
                  Ver todos los empleos
                </Link>
              </>
            ) : (
              <p>No hay empleos disponibles en este momento.</p>
            )}
          </div>
        ) : (
          filteredJobs.map((job) => (
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
