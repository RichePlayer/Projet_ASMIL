import React, { useState } from "react";
import { Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardCheck,
  FileText,
  CreditCard,
  User,
  LogOut,
  Award,
  Menu,
  X,
  ChevronDown,
  UserCircle,
  Bell,
  Settings,
  Users,
  Loader2,
  Shield,
  Database,
  UserCog
} from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import NotificationDropdown from "@/components/NotificationDropdown";

// ADMIN MENU - Only admin pages
const adminMenuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { name: "Utilisateurs", icon: Users, path: "/admin/users" },
  { name: "Enseignants", icon: UserCog, path: "/admin/teachers" },
  { name: "Formations", icon: BookOpen, path: "/admin/formations" },
  { name: "Modules", icon: FileText, path: "/admin/modules" },
  { name: "Sessions", icon: Calendar, path: "/admin/sessions" },
  { name: "Logs", icon: Shield, path: "/admin/logs" },
  { name: "Sauvegardes", icon: Database, path: "/admin/backups" },
  { name: "Paramètres", icon: Settings, path: "/admin/settings" },
];

// SECRETARY MENU - Only operational pages
const secretaryMenuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/secretary/dashboard" },
  { name: "Étudiants", icon: GraduationCap, path: "/secretary/students" },
  { name: "Inscriptions", icon: ClipboardCheck, path: "/secretary/enrollments" },
  { name: "Paiements", icon: CreditCard, path: "/secretary/payments" },
  { name: "Notes", icon: FileText, path: "/secretary/grades" },
  { name: "Présences", icon: ClipboardCheck, path: "/secretary/attendance" },
  { name: "Certificats", icon: Award, path: "/secretary/certificates" },
  { name: "Annonces", icon: Bell, path: "/secretary/announcements" },
  { name: "Emploi du Temps", icon: Calendar, path: "/secretary/timetable" },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get menu items based on role - COMPLETELY SEPARATE
  const menuItems = user?.role === "Admin" ? adminMenuItems : secretaryMenuItems;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* ============================ */}
      {/* SIDEBAR DESKTOP (FIXE)      */}
      {/* ============================ */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:top-0 lg:left-0 lg:h-screen bg-white border-r border-slate-100 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-30">
        {/* LOGO */}
        <div className="flex flex-col items-center justify-center h-24 px-8 border-b border-slate-50">
          <div className="relative group cursor-pointer transition-transform duration-300 hover:scale-105">
            <div className="absolute -inset-3 bg-red-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <img
              src="/logo_asmil.jpg"
              alt="ASMiL Logo"
              className="relative h-14 w-auto object-contain rounded-xl shadow-sm"
            />
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar space-y-2">
          <div className="px-4 mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {user.role === "Admin" ? "Administration" : "Gestion"}
          </div>
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`group flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ease-out
                      ${isActive
                        ? "bg-red-600 text-white shadow-lg shadow-red-600/20 translate-x-1"
                        : "text-slate-500 hover:bg-red-50 hover:text-red-700 hover:translate-x-1"
                      }`}
                  >
                    <Icon className={`h-5 w-5 transition-colors duration-300 ${isActive ? "text-white" : "text-slate-400 group-hover:text-red-600"}`} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* PROFIL (simple) */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <Link to="/profile">
            <div className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-200 transition-all duration-300 cursor-pointer group">
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white font-bold text-xs">{user.full_name[0]}</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold text-slate-900 truncate group-hover:text-red-600 transition-colors">{user.full_name}</p>
                <p className="text-[11px] font-medium text-slate-500 truncate">{user.role}</p>
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* ============================ */}
      {/* HEADER MOBILE                */}
      {/* ============================ */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 z-40 flex items-center px-4 justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="-ml-2">
            <Menu className="h-6 w-6 text-slate-700" />
          </Button>
          <img src="/logo_asmil.jpg" alt="ASMiL" className="h-8 object-contain" />
        </div>
        <Avatar className="h-8 w-8 border border-slate-200">
          <AvatarFallback className="bg-red-50 text-red-600 font-bold text-xs">{user.full_name[0]}</AvatarFallback>
        </Avatar>
      </div>

      {/* ============================ */}
      {/* SIDEBAR MOBILE               */}
      {/* ============================ */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-72 bg-white shadow-2xl z-50 animate-in slide-in-from-left duration-300 flex flex-col">
            <div className="h-16 border-b px-6 flex items-center justify-between bg-slate-50/50">
              <span className="font-bold text-lg text-slate-900">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5 text-slate-500" />
              </Button>
            </div>
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {menuItems.map(item => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5 text-slate-400" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}

      {/* ============================ */}
      {/* CONTENU CENTRAL              */}
      {/* ============================ */}
      <main className="lg:pl-72 min-h-screen transition-all duration-300">
        {/* HEADER DESKTOP */}
        <header className="hidden lg:flex h-16 items-center justify-end px-8 sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            {user.role === "Admin" && (
              <>
                <NotificationDropdown />
                <div className="h-6 w-px bg-slate-200 mx-1" />
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 outline-none">
                  <Avatar className="h-8 w-8 border border-slate-200">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-red-600 text-white text-xs font-bold">{user.full_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm mr-1">
                    <span className="font-semibold text-slate-700 leading-none text-xs">{user.full_name}</span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl border-slate-100 bg-white">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer focus:bg-slate-50">
                  <Link to="/profile" className="flex items-center w-full">
                    <UserCircle className="h-4 w-4 mr-2 text-slate-500" /> Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 pb-20 max-w-[1600px] mx-auto animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
