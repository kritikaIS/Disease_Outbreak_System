import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import ClinicalDashboard from "./pages/ClinicalDashboard";
import Trends from "./pages/Trends";
import HealthcarePortal from "./pages/HealthcarePortal";
import PublicAuth from "./pages/PublicAuth";
import PublicDashboard from "./pages/PublicDashboard";
import DoctorAuth from "./pages/DoctorAuth";
import DoctorProfile from "./pages/DoctorProfile";
import Header from "./components/Header";

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('jwt') : null;
  if (!token) return <Navigate to="/" replace />;
  return children;
};

const RequireDoctorAuth = ({ children }: { children: JSX.Element }) => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('jwt') : null;
  const doctor = typeof window !== 'undefined' ? sessionStorage.getItem('doctor') : null;
  if (!token || !doctor) return <Navigate to="/doctor-auth" replace />;
  return children;
};

const DoctorProfileWrapper = () => {
  const token = sessionStorage.getItem('jwt') || '';
  const doctor = JSON.parse(sessionStorage.getItem('doctor') || '{}');
  
  return <DoctorProfile doctor={doctor} token={token} />;
};

const App = () => (
  <BrowserRouter>
    <div className="min-h-screen bg-background">
      <Toaster />
      <Sonner />
      <Header />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/public-auth" element={<PublicAuth />} />
        <Route path="/public" element={<PublicDashboard />} />
        <Route path="/doctor-auth" element={<DoctorAuth onSuccess={() => window.location.href = '/doctor-profile'} />} />
        <Route path="/doctor-profile" element={
          <RequireDoctorAuth>
            <DoctorProfileWrapper />
          </RequireDoctorAuth>
        } />
        <Route path="/dashboard" element={
          <RequireAuth>
            <ClinicalDashboard />
          </RequireAuth>
        } />
        <Route path="/portal" element={
          <RequireAuth>
            <HealthcarePortal />
          </RequireAuth>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  </BrowserRouter>
);

export default App;
