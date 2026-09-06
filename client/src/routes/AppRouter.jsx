import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Route guards
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Auth pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Dashboards
import StudentDashboard from '../pages/student/Dashboard';
import CompanyDashboard from '../pages/company/Dashboard';
import AdminDashboard from '../pages/admin/Dashboard';

// ── Student pages ──
import StudentProfile from '../pages/student/Profile';
import StudentDrives from '../pages/student/Drives';
import DriveDetail from '../pages/student/DriveDetail';
import StudentApplications from '../pages/student/Applications';
import ResumeAnalyzer from '../pages/student/ResumeAnalyzer';
import StudentInterviews from '../pages/student/Interviews';
import StudentNotifications from '../pages/student/Notifications';

// ── Company pages ──
import CompanyDrives from '../pages/company/Drives';
import DriveForm from '../pages/company/DriveForm';
import Applicants from '../pages/company/Applicants';
import CompanyInterviews from '../pages/company/Interviews';
import CompanyNotifications from '../pages/company/Notifications';

// ── Admin / T&P Cell pages ──
import AdminStudents from '../pages/admin/Students';
import AdminCompanies from '../pages/admin/Companies';
import AdminDrives from '../pages/admin/Drives';
import AdminApplications from '../pages/admin/Applications';
import AdminAnalytics from '../pages/admin/Analytics';

// Placeholder
import ComingSoon from '../pages/ComingSoon';

// Root redirect: site opens to login by default
const RootRedirect = () => {
  return <Navigate to="/login" replace />;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root */}
        <Route path="/" element={<RootRedirect />} />

        {/* ─── Public auth routes ─── */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* ─── Protected routes ─── */}
        <Route element={<ProtectedRoute />}>

          {/* STUDENT routes */}
          <Route element={<RoleRoute role="student" />}>
            <Route element={<DashboardLayout />}>
              <Route path="/student/dashboard"    element={<StudentDashboard />} />
              <Route path="/student/profile"      element={<StudentProfile />} />
              <Route path="/student/drives"       element={<StudentDrives />} />
              <Route path="/student/drives/:id"   element={<DriveDetail />} />
              <Route path="/student/applications" element={<StudentApplications />} />
              <Route path="/student/resume"       element={<ResumeAnalyzer />} />
              <Route path="/student/interviews"   element={<StudentInterviews />} />
              <Route path="/student/notifications" element={<StudentNotifications />} />
            </Route>
          </Route>

          {/* COMPANY routes */}
          <Route element={<RoleRoute role="company" />}>
            <Route element={<DashboardLayout />}>
              <Route path="/company/dashboard"              element={<CompanyDashboard />} />
              <Route path="/company/profile"                element={<ComingSoon pageName="Company Profile" />} />
              <Route path="/company/drives"                 element={<CompanyDrives />} />
              <Route path="/company/drives/new"             element={<DriveForm />} />
              <Route path="/company/drives/:id/edit"        element={<DriveForm />} />
              <Route path="/company/applicants"             element={<Applicants />} />
              <Route path="/company/drives/:driveId/applicants" element={<Applicants />} />
              <Route path="/company/interviews"             element={<CompanyInterviews />} />
              <Route path="/company/notifications"          element={<CompanyNotifications />} />
            </Route>
          </Route>

          {/* T&P CELL & ADMIN routes */}
          <Route element={<RoleRoute roles={['admin', 'tpcell']} />}>
            <Route element={<DashboardLayout />}>
              {/* T&P Cell paths */}
              <Route path="/tpcell/dashboard"    element={<AdminDashboard />} />
              <Route path="/tpcell/students"     element={<AdminStudents />} />
              <Route path="/tpcell/companies"    element={<AdminCompanies />} />
              <Route path="/tpcell/drives"       element={<AdminDrives />} />
              <Route path="/tpcell/applications" element={<AdminApplications />} />
              <Route path="/tpcell/analytics"    element={<AdminAnalytics />} />

              {/* Admin alias paths */}
              <Route path="/admin/dashboard"    element={<AdminDashboard />} />
              <Route path="/admin/students"     element={<AdminStudents />} />
              <Route path="/admin/companies"    element={<AdminCompanies />} />
              <Route path="/admin/drives"       element={<AdminDrives />} />
              <Route path="/admin/applications" element={<AdminApplications />} />
              <Route path="/admin/analytics"    element={<AdminAnalytics />} />
            </Route>
          </Route>

        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
