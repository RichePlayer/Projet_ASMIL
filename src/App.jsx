import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Layout from "./layout/Layout";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import AdminTeachers from "./pages/admin/Teachers";
import AdminFormations from "./pages/admin/Formations";
import AdminModules from "./pages/admin/Modules";
import AdminSessions from "./pages/admin/Sessions";
import FinanceOverview from "./pages/admin/FinanceOverview";
import Logs from "./pages/admin/Logs";
import Backups from "./pages/admin/Backups";
import SystemSettings from "./pages/admin/SystemSettings";

// Secretary Pages
import SecretaryDashboard from "./pages/secretary/Dashboard";
import SecretaryStudents from "./pages/secretary/Students";
import SecretaryInvoices from "./pages/secretary/Invoices";
import SecretaryGrades from "./pages/secretary/Grades";
import SecretaryAttendance from "./pages/secretary/Attendance";
import SecretaryCertificates from "./pages/secretary/Certificates";
import SecretaryAnnouncements from "./pages/secretary/Announcements";
import SecretaryTimetable from "./pages/secretary/Timetable";
import SecretaryEnrollments from "./pages/secretary/Enrollments";

// Shared Pages
import Profile from "./pages/Profile";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes (Wrapped in Layout) */}
          <Route
            element={
              <Layout>
                <Outlet />
              </Layout>
            }
          >
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Admin Routes - ONLY for Admin */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/teachers" element={<AdminTeachers />} />
            <Route path="/admin/formations" element={<AdminFormations />} />
            <Route path="/admin/modules" element={<AdminModules />} />
            <Route path="/admin/sessions" element={<AdminSessions />} />
            <Route path="/admin/finance" element={<FinanceOverview />} />
            <Route path="/admin/logs" element={<Logs />} />
            <Route path="/admin/backups" element={<Backups />} />
            <Route path="/admin/settings" element={<SystemSettings />} />

            {/* Secretary Routes - ONLY for Secretary */}
            <Route path="/secretary/dashboard" element={<SecretaryDashboard />} />
            <Route path="/secretary/students" element={<SecretaryStudents />} />
            <Route path="/secretary/invoices" element={<SecretaryInvoices />} />
            <Route path="/secretary/grades" element={<SecretaryGrades />} />
            <Route path="/secretary/enrollments" element={<SecretaryEnrollments />} />
            <Route path="/secretary/attendance" element={<SecretaryAttendance />} />
            <Route path="/secretary/certificates" element={<SecretaryCertificates />} />
            <Route path="/secretary/announcements" element={<SecretaryAnnouncements />} />
            <Route path="/secretary/timetable" element={<SecretaryTimetable />} />

            {/* Shared Routes */}
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
