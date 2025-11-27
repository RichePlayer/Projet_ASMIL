import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Lock, Mail, ArrowRight, User, ShieldCheck } from "lucide-react";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("secretaire@asmil.mg");
    const [password, setPassword] = useState("password");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const user = await login(email, password);
            if (user.role === "Admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/secretary/dashboard");
            }
        } catch (err) {
            setError("Email ou mot de passe incorrect.");
        } finally {
            setIsLoading(false);
        }
    };

    const fillCredentials = (role) => {
        if (role === "admin") {
            setEmail("admin@asmil.mg");
            setPassword("admin123");
        } else {
            setEmail("secretaire@asmil.mg");
            setPassword("password");
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-50">
            {/* Left Side - Hero / Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/95 to-red-900/40"></div>

                <div className="relative z-10 px-16 text-white max-w-2xl">
                    <div className="mb-10 animate-fade-in-up">
                        <img src="/logo_asmil.jpg" alt="ASMiL Logo" className="h-24 w-auto rounded-2xl shadow-2xl border-4 border-white/5" />
                    </div>
                    <h1 className="text-5xl font-bold mb-6 tracking-tight leading-tight animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                        Institut <span className="text-red-500">ASMiL</span>
                    </h1>
                    <p className="text-slate-300 text-xl leading-relaxed mb-10 font-light animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                        Plateforme de gestion académique unifiée. <br />
                        L'excellence au service de l'éducation.
                    </p>

                    <div className="grid grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="text-red-400 font-semibold mb-1">Sécurisé</div>
                            <div className="text-xs text-slate-400">Protection des données et accès contrôlé.</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="text-red-400 font-semibold mb-1">Performant</div>
                            <div className="text-xs text-slate-400">Gestion fluide et temps réel.</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-white lg:bg-slate-50">
                <div className="w-full max-w-md space-y-8 bg-white lg:p-10 lg:rounded-2xl lg:shadow-xl lg:border lg:border-slate-100">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Connexion</h2>
                        <p className="text-slate-500 mt-2 text-sm">Accédez à votre espace de gestion</p>
                    </div>

                    {/* Demo Credentials Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <Button
                            variant="outline"
                            className="flex flex-col h-auto py-3 border-slate-200 hover:border-red-200 hover:bg-red-50/50"
                            onClick={() => fillCredentials("user")}
                        >
                            <User className="h-5 w-5 text-slate-600 mb-1" />
                            <span className="text-xs font-bold text-slate-700">Secrétaire</span>
                            <span className="text-[10px] text-slate-400">Utilisateur</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="flex flex-col h-auto py-3 border-slate-200 hover:border-red-200 hover:bg-red-50/50"
                            onClick={() => fillCredentials("admin")}
                        >
                            <ShieldCheck className="h-5 w-5 text-red-600 mb-1" />
                            <span className="text-xs font-bold text-slate-700">Admin</span>
                            <span className="text-[10px] text-slate-400">Administrateur</span>
                        </Button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700 font-medium">Email Professionnel</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="nom@asmil.mg"
                                        className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-red-500 focus:ring-red-500/20 transition-all"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-700 font-medium">Mot de passe</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-red-500 focus:ring-red-500/20 transition-all"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold text-base transition-all shadow-lg shadow-red-600/20 hover:shadow-red-600/30 hover:-translate-y-0.5"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Connexion...
                                </>
                            ) : (
                                <>
                                    Se connecter <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="pt-6 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-400 font-medium">© 2025 ASMiL Institute</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
