import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { jobs, applications } from '../services/api';

const JobApplications = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [jobApplications, setJobApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [jobRes, appsRes] = await Promise.all([
        jobs.getById(id),
        jobs.getApplications(id),
      ]);
      setJob(jobRes.data);
      setJobApplications(appsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await applications.updateStatus(applicationId, newStatus);
      setJobApplications(
        jobApplications.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado');
    }
  };

  const getStatusLabel = (status) => {
    const statuses = {
      pending: 'Pendiente',
      reviewing: 'En Revisión',
      interview: 'Entrevista',
      accepted: 'Aceptado',
      rejected: 'Rechazado',
    };
    return statuses[status] || status;
  };

  if (loading) {
    return <div className="loading">Cargando aplicaciones...</div>;
  }

  if (!job) {
    return <div className="no-data">Empleo no encontrado</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Aplicaciones para {job.title}</h1>
          <p className="subtitle">{jobApplications.length} aplicaciones recibidas</p>
        </div>
      </div>

      {jobApplications.length === 0 ? (
        <div className="no-data">
          <p>No hay aplicaciones para este empleo todavía.</p>
        </div>
      ) : (
        <div className="applications-list">
          {jobApplications.map((app) => (
            <div key={app.id} className="application-card-detailed">
              <div className="application-student-info">
                <h3>{app.student.user.first_name} {app.student.user.last_name}</h3>
                <p>📧 {app.student.user.email}</p>
                <p>📞 {app.student.user.phone}</p>
                <p>🎓 {app.student.career} - {app.student.university}</p>
                <p>📅 Semestre {app.student.semester} | Graduación {app.student.graduation_year}</p>
              </div>

              {app.student.skills && (
                <div className="application-section">
                  <strong>Habilidades:</strong>
                  <p>{app.student.skills}</p>
                </div>
              )}

              {app.cover_letter && (
                <div className="application-section">
                  <strong>Carta de Presentación:</strong>
                  <p>{app.cover_letter}</p>
                </div>
              )}

              <div className="application-links">
                {app.student.cv_url && (
                  <a href={app.student.cv_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-small">
                    Ver CV
                  </a>
                )}
                {app.student.linkedin_url && (
                  <a href={app.student.linkedin_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-small">
                    LinkedIn
                  </a>
                )}
              </div>

              <div className="application-status-section">
                <label htmlFor={`status-${app.id}`}>Estado:</label>
                <select
                  id={`status-${app.id}`}
                  value={app.status}
                  onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pendiente</option>
                  <option value="reviewing">En Revisión</option>
                  <option value="interview">Entrevista</option>
                  <option value="accepted">Aceptado</option>
                  <option value="rejected">Rechazado</option>
                </select>
              </div>

              <div className="application-meta">
                <span>Aplicó el {new Date(app.applied_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobApplications;
