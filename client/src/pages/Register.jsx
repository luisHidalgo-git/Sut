import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    user_type: 'student',
    phone: '',
    university: '',
    career: '',
    semester: '',
    graduation_year: '',
    company_name: '',
    industry: 'tech',
    description: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const submitData = { ...formData };

    if (formData.user_type === 'student') {
      delete submitData.company_name;
      delete submitData.industry;
      delete submitData.description;
      delete submitData.address;
    } else if (formData.user_type === 'company') {
      delete submitData.university;
      delete submitData.career;
      delete submitData.semester;
      delete submitData.graduation_year;
    }

    try {
      await register(submitData);
      setSuccess('Registro exitoso. Redirigiendo...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData) {
        const errorMessage =
          errorData.email?.[0] ||
          errorData.password?.[0] ||
          errorData.student_profile ||
          errorData.company_profile ||
          errorData.non_field_errors?.[0] ||
          'Error al registrarse. Verifica los campos.';
        setError(errorMessage);
      } else {
        setError('Error al conectar con el servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>Crear Cuenta</h2>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="user_type">Tipo de Usuario</label>
              <select
                id="user_type"
                name="user_type"
                value={formData.user_type}
                onChange={handleChange}
                required
              >
                <option value="student">Estudiante</option>
                <option value="company">Empresa</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">Nombre</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Apellido</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Teléfono</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password_confirm">Confirmar Contraseña</label>
              <input
                type="password"
                id="password_confirm"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>

            {formData.user_type === 'student' && (
              <>
                <div className="form-group">
                  <label htmlFor="university">Universidad *</label>
                  <input
                    type="text"
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="career">Carrera *</label>
                  <input
                    type="text"
                    id="career"
                    name="career"
                    value={formData.career}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="semester">Semestre *</label>
                    <input
                      type="number"
                      id="semester"
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      required
                      min="1"
                      max="12"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="graduation_year">Año de Graduación *</label>
                    <input
                      type="number"
                      id="graduation_year"
                      name="graduation_year"
                      value={formData.graduation_year}
                      onChange={handleChange}
                      required
                      min="2024"
                      max="2035"
                    />
                  </div>
                </div>
              </>
            )}

            {formData.user_type === 'company' && (
              <>
                <div className="form-group">
                  <label htmlFor="company_name">Nombre de la Empresa *</label>
                  <input
                    type="text"
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="industry">Industria *</label>
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    required
                  >
                    <option value="tech">Tecnología</option>
                    <option value="finance">Finanzas</option>
                    <option value="healthcare">Salud</option>
                    <option value="education">Educación</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufactura</option>
                    <option value="services">Servicios</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Descripción de la Empresa *</label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Dirección *</label>
                  <textarea
                    id="address"
                    name="address"
                    rows="2"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          <p className="auth-footer">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
