import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardCheck,
  FileText,
  CreditCard,
  Bell,
  BarChart3,
  User,
  LogOut,
  Settings,
  Menu,
  X
} from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Étudiants", icon: GraduationCap, path: "/students" },
  { name: "Enseignants", icon: User, path: "/teachers" },
  { name: "Formations", icon: BookOpen, path: "/formations" },
  { name: "Modules", icon: FileText, path: "/modules" },
  { name: "Sessions", icon: Calendar, path: "/sessions" },
  { name: "Inscriptions", icon: ClipboardCheck, path: "/enrollments" },
  { name: "Présences", icon: ClipboardCheck, path: "/attendance" },
  { name: "Notes", icon: FileText, path: "/grades" },
  { name: "Facturation", icon: CreditCard, path: "/invoices" },
  { name: "Annonces", icon: Bell, path: "/announcements" },
  { name: "Rapports", icon: BarChart3, path: "/reports" },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const user = {
    full_name: "Admin User",
    role: "admin",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/10 to-slate-50">

      {/* ============================ */}
      {/* SIDEBAR DESKTOP (FIXE)      */}
      {/* ============================ */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:top-0 lg:left-0 lg:h-screen bg-white border-r shadow-sm">

        {/* LOGO */}
        <div className="flex items-center justify-center border-b h-24 px-4">
          <img
            src="/logo.jpg"
            alt="ASMiL Logo"
            className="h-16 object-contain"
          />
        </div>


        {/* MENU */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all 
                      ${isActive
                        ? "bg-red-600 text-white shadow-md"
                        : "text-slate-700 hover:bg-red-50 hover:text-red-600"
                      }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* PROFIL (simple) */}
        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50">
                <div className="h-10 w-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
                  {user.full_name[0]}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-semibold">{user.full_name}</span>
                  <span className="text-xs text-slate-500">{user.role}</span>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" /> Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* ============================ */}
      {/* HEADER MOBILE                */}
      {/* ============================ */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b shadow-sm z-40 flex items-center px-4 gap-4">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="h-6 w-6 text-slate-600" />
        </button>
        <img src="/logo.png" alt="ASMiL Logo" className="h-12" />
      </div>

      {/* ============================ */}
      {/* SIDEBAR MOBILE               */}
      {/* ============================ */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSidebarOpen(false)} />

          <div className="fixed left-0 top-0 h-full w-72 bg-white shadow-xl z-50 animate-slide-right">

            {/* Header mobile */}
            <div className="h-16 border-b px-6 flex items-center justify-between">
              <img src="/logo.jpg" alt="ASMiL Logo" className="h-12" />
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6 text-slate-700" />
              </button>
            </div>

            <nav className="px-6 py-4 space-y-1">
              {menuItems.map(item => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-slate-700"
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5 text-slate-500" />
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
      <main className="lg:pl-72 lg:ml-8">
  <div className="px-4 py-6 sm:px-6 lg:px-8">
    {children}
  </div>
</main>



    </div>
  );
}
