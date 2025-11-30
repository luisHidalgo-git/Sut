import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobs, applications } from '../services/api';
import { useAuth } from '../context/AuthContext';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    fetchJobDetail();
  }, [id]);

  const fetchJobDetail = async () => {
    try {
      const response = await jobs.getById(id);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setApplying(true);
    try {
      await applications.create({
        job_id: id,
        cover_letter: coverLetter,
      });
      alert('¡Aplicación enviada exitosamente!');
      navigate('/my-applications');
    } catch (error) {
      alert(error.response?.data?.non_field_errors?.[0] || 'Error al aplicar');
    } finally {
      setApplying(false);
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
    return <div className="loading">Cargando...</div>;
  }

  if (!job) {
    return <div className="no-data">Empleo no encontrado</div>;
  }

  return (
    <div className="page-container">
      <div className="job-detail">
        <div className="job-detail-header">
          <div>
            <h1>{job.title}</h1>
            <h2>{job.company.company_name}</h2>
            <div className="job-meta">
              <span className="job-type-badge">{getJobTypeLabel(job.job_type)}</span>
              <span>📍 {job.location}</span>
              {job.deadline && <span>📅 Fecha límite: {job.deadline}</span>}
            </div>
          </div>

          {user?.user_type === 'student' && !showApplicationForm && (
            <button
              onClick={() => setShowApplicationForm(true)}
              className="btn btn-primary btn-large"
            >
              Aplicar Ahora
            </button>
          )}
        </div>

        {showApplicationForm && user?.user_type === 'student' && (
          <div className="application-form">
            <h3>Aplicar a este empleo</h3>
            <form onSubmit={handleApply}>
              <div className="form-group">
                <label htmlFor="cover_letter">Carta de Presentación</label>
                <textarea
                  id="cover_letter"
                  rows="6"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Explica por qué eres el candidato ideal para este puesto..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={applying}>
                  {applying ? 'Enviando...' : 'Enviar Aplicación'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowApplicationForm(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {job.salary_min && job.salary_max && (
          <div className="job-salary-range">
            <strong>Rango Salarial:</strong> ${job.salary_min} - ${job.salary_max}
          </div>
        )}

        <section className="job-section">
          <h3>Descripción del Puesto</h3>
          <p>{job.description}</p>
        </section>

        <section className="job-section">
          <h3>Responsabilidades</h3>
          <p>{job.responsibilities}</p>
        </section>

        <section className="job-section">
          <h3>Requisitos</h3>
          <p>{job.requirements}</p>
        </section>

        <section className="job-section">
          <h3>Acerca de {job.company.company_name}</h3>
          <p>{job.company.description}</p>
          {job.company.website && (
            <p>
              <strong>Sitio web:</strong>{' '}
              <a href={job.company.website} target="_blank" rel="noopener noreferrer">
                {job.company.website}
              </a>
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default JobDetail;
