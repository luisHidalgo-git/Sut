import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applications } from '../services/api';

const MyApplications = () => {
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await applications.getAll();
      setMyApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
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

  const getStatusClass = (status) => {
    const classes = {
      pending: 'status-pending',
      reviewing: 'status-reviewing',
      interview: 'status-interview',
      accepted: 'status-accepted',
      rejected: 'status-rejected',
    };
    return classes[status] || '';
  };

  if (loading) {
    return <div className="loading">Cargando aplicaciones...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Mis Aplicaciones</h1>
      </div>

      {myApplications.length === 0 ? (
        <div className="no-data">
          <p>No has aplicado a ningún empleo todavía.</p>
          <Link to="/jobs" className="btn btn-primary">
            Explorar Empleos
          </Link>
        </div>
      ) : (
        <div className="applications-list">
          {myApplications.map((app) => (
            <div key={app.id} className="application-card">
              <div className="application-header">
                <div>
                  <h3>{app.job.title}</h3>
                  <p className="application-company">{app.job.company.company_name}</p>
                </div>
                <span className={`status-badge ${getStatusClass(app.status)}`}>
                  {getStatusLabel(app.status)}
                </span>
              </div>

              <div className="application-details">
                <div className="application-info">
                  <span>📍 {app.job.location}</span>
                  <span>📅 Aplicado: {new Date(app.applied_at).toLocaleDateString()}</span>
                </div>

                {app.cover_letter && (
                  <div className="application-cover-letter">
                    <strong>Carta de Presentación:</strong>
                    <p>{app.cover_letter}</p>
                  </div>
                )}

                {app.notes && (
                  <div className="application-notes">
                    <strong>Notas de la empresa:</strong>
                    <p>{app.notes}</p>
                  </div>
                )}
              </div>

              <div className="application-footer">
                <Link to={`/jobs/${app.job.id}`} className="btn btn-secondary btn-small">
                  Ver Empleo
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
