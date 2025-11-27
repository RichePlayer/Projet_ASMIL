import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Formations from "./pages/Formations";
import Modules from "./pages/Modules";
import Sessions from "./pages/Sessions";
import Enrollments from "./pages/Enrollments";
import Timetable from "./pages/Timetable";
import Attendance from "./pages/Attendance";
import Grades from "./pages/Grades";
import Invoices from "./pages/Invoices";
import Announcements from "./pages/Announcements";
import Certificates from "./pages/Certificates";

export default function App() {
  return (
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/students" element={<Students />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/formations" element={<Formations />} />
          <Route path="/modules" element={<Modules />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/enrollments" element={<Enrollments />} />
          <Route path="/Timetable" element={<Timetable />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/grades" element={<Grades />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/certificates" element={<Certificates />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
