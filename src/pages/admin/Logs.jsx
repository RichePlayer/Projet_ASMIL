// src/pages/admin/Logs.jsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getAllAuditLogs, getAuditStats, clearOldLogs } from "@/utils/auditLogApi";
import { Search, Trash2, Shield, User, FileText, Settings, AlertCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { formatDate } from "@/utils/exportHelpers";
import { useTranslation } from 'react-i18next';

export default function Logs() {
    const { t } = useTranslation();
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        todayCount: 0,
        weekCount: 0,
        failedLogins: 0
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0
    });

    // Load logs and stats on mount and when filters change
    useEffect(() => {
        loadLogs();
    }, [pagination.page, categoryFilter, dateFilter, searchTerm]);

    useEffect(() => {
        loadStats();
    }, []);

    // Load logs
    const loadLogs = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit
            };

            // Add filters
            if (categoryFilter !== "all") {
                params.category = categoryFilter;
            }

            if (dateFilter !== "all") {
                const now = new Date();
                let startDate = new Date();

                switch (dateFilter) {
                    case "today":
                        startDate.setHours(0, 0, 0, 0);
                        break;
                    case "week":
                        startDate.setDate(now.getDate() - 7);
                        break;
                    case "month":
                        startDate.setMonth(now.getMonth() - 1);
                        break;
                }

                params.start_date = startDate.toISOString();
                params.end_date = now.toISOString();
            }

            if (searchTerm) {
                params.search = searchTerm;
            }

            const response = await getAllAuditLogs(params);
            setLogs(response.auditLogs || []);
            setPagination(prev => ({
                ...prev,
                total: response.pagination.total,
                totalPages: response.pagination.totalPages
            }));
        } catch (error) {
            console.error('Erreur chargement logs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load statistics
    const loadStats = async () => {
        try {
            const response = await getAuditStats();
            setStats(response.statistics || {
                total: 0,
                todayCount: 0,
                weekCount: 0,
                failedLogins: 0
            });
        } catch (error) {
            console.error('Erreur chargement statistiques:', error);
        }
    };

    // Get action badge
    const getActionBadge = (action) => {
        const category = action.split('.')[0];
        const badges = {
            auth: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Shield, label: "Auth" },
            user: { color: "bg-violet-100 text-violet-700 border-violet-200", icon: User, label: "User" },
            student: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: User, label: "Student" },
            teacher: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: User, label: "Teacher" },
            invoice: { color: "bg-red-100 text-red-700 border-red-200", icon: FileText, label: "Invoice" },
            payment: { color: "bg-green-100 text-green-700 border-green-200", icon: FileText, label: "Payment" },
            system: { color: "bg-slate-100 text-slate-700 border-slate-200", icon: Settings, label: "System" },
            permission: { color: "bg-orange-100 text-orange-700 border-orange-200", icon: Shield, label: "Permission" },
        };

        const badge = badges[category] || { color: "bg-gray-100 text-gray-700 border-gray-200", icon: AlertCircle, label: category };
        const Icon = badge.icon;

        return (
            <Badge className={`${badge.color} border font-medium flex items-center gap-1 w-fit`}>
                <Icon className="h-3 w-3" />
                {badge.label}
            </Badge>
        );
    };

    // Get action description
    const getActionDescription = (log) => {
        const parts = log.action.split('.');
        const action = parts[1] || '';

        const descriptions = {
            login: "Connexion",
            logout: "Déconnexion",
            login_failed: "Échec de connexion",
            create: "Création",
            update: "Modification",
            delete: "Suppression",
            activate: "Activation",
            deactivate: "Désactivation",
            password_reset: "Réinitialisation mot de passe",
            settings_update: "Mise à jour paramètres",
            backup_create: "Création sauvegarde",
            backup_restore: "Restauration sauvegarde",
            data_export: "Export de données",
        };

        return descriptions[action] || action;
    };

    // Handle clear old logs
    const handleClearOldLogs = async () => {
        if (confirm("Êtes-vous sûr de vouloir supprimer les logs de plus de 90 jours? Cette action est irréversible.")) {
            try {
                await clearOldLogs(90);
                loadLogs();
                loadStats();
            } catch (error) {
                console.error('Erreur suppression logs:', error);
                alert('Erreur lors de la suppression des logs');
            }
        }
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('logs.title')}</h1>
                    <p className="text-slate-500 mt-1">{t('logs.subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleClearOldLogs} className="gap-2 text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                        {t('logs.clearOldLogs')}
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="border-none shadow-md bg-gradient-to-br from-white to-slate-50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">{t('logs.stats.totalLogs')}</p>
                                <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-slate-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600">{t('logs.stats.today')}</p>
                                <h3 className="text-2xl font-bold text-blue-900">{stats.todayCount}</h3>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <Shield className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-emerald-50 to-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-emerald-600">{t('logs.stats.thisWeek')}</p>
                                <h3 className="text-2xl font-bold text-emerald-900">{stats.weekCount}</h3>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-red-50 to-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-600">{t('logs.stats.failedLogins')}</p>
                                <h3 className="text-2xl font-bold text-red-900">{stats.failedLogins}</h3>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-none shadow-md">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Rechercher dans les logs..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setPagination(prev => ({ ...prev, page: 1 }));
                                    }}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <Select value={categoryFilter} onValueChange={(value) => {
                            setCategoryFilter(value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes catégories</SelectItem>
                                <SelectItem value="auth">Authentification</SelectItem>
                                <SelectItem value="user">Utilisateurs</SelectItem>
                                <SelectItem value="student">Étudiants</SelectItem>
                                <SelectItem value="teacher">Enseignants</SelectItem>
                                <SelectItem value="invoice">Factures</SelectItem>
                                <SelectItem value="payment">Paiements</SelectItem>
                                <SelectItem value="system">Système</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Date Filter */}
                        <Select value={dateFilter} onValueChange={(value) => {
                            setDateFilter(value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Période" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes périodes</SelectItem>
                                <SelectItem value="today">Aujourd'hui</SelectItem>
                                <SelectItem value="week">Cette semaine</SelectItem>
                                <SelectItem value="month">Ce mois</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Logs Table */}
            <Card className="border-none shadow-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Logs ({pagination.total})</CardTitle>
                            <CardDescription>Historique des actions système</CardDescription>
                        </div>
                        {loading && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date/Heure</TableHead>
                                    <TableHead>Catégorie</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Utilisateur</TableHead>
                                    <TableHead>Détails</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                                            Aucun log trouvé
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-sm text-slate-600">
                                                {formatDate(log.created_at, 'datetime')}
                                            </TableCell>
                                            <TableCell>{getActionBadge(log.action)}</TableCell>
                                            <TableCell className="font-medium">{getActionDescription(log)}</TableCell>
                                            <TableCell>
                                                {log.user_name ? (
                                                    <div>
                                                        <p className="font-medium text-sm">{log.user_name}</p>
                                                        <p className="text-xs text-slate-500">{log.user_email}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-sm">Système</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600 max-w-xs truncate">
                                                {log.details ? JSON.stringify(log.details) : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-slate-500">
                                Page {pagination.page} sur {pagination.totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1 || loading}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Précédent
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages || loading}
                                >
                                    Suivant
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
