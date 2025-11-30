import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import MyApplications from './pages/MyApplications';
import CreateJob from './pages/CreateJob';
import MyJobs from './pages/MyJobs';
import JobApplications from './pages/JobApplications';
import StudentProfile from './pages/StudentProfile';
import CompanyProfile from './pages/CompanyProfile';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/jobs/:id/applications" element={<JobApplications />} />
              <Route path="/my-applications" element={<MyApplications />} />
              <Route path="/create-job" element={<CreateJob />} />
              <Route path="/my-jobs" element={<MyJobs />} />
              <Route path="/profile/student" element={<StudentProfile />} />
              <Route path="/profile/company" element={<CompanyProfile />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

