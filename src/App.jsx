import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Events from './pages/Events'
import StudentDashboard from './pages/StudentDashboard'
import Register from './pages/Register'
import CoordinatorDashboard from './pages/CoordinatorDashboard'
import Certificates from './pages/Certificates'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'
import TeamBuilding from './pages/TeamBuilding'
import FacultyDashboard from './pages/FacultyDashboard'
import VolunteerDashboard from './pages/VolunteerDashboard'
import DeanDashboard from './pages/DeanDashboard'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/events" element={<Events />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/coordinator" element={<CoordinatorDashboard />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/team-building" element={<TeamBuilding />} />
        <Route path="/faculty" element={<FacultyDashboard />} />
        <Route path="/volunteer" element={<VolunteerDashboard />} />
        <Route path="/admin" element={<DeanDashboard />} />
        
      </Routes>
    </BrowserRouter>
  )
}

export default App