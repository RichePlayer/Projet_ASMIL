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
import ExportButton from "@/components/shared/ExportButton";
import { getAuditLogs, filterAuditLogs, exportAuditLogs, clearAuditLogs } from "@/utils/auditLog";
import { Search, Download, Trash2, Shield, User, FileText, Settings, Database, AlertCircle } from "lucide-react";
import { formatDate } from "@/utils/exportHelpers";

export default function Logs() {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");

    // Load logs on mount
    useEffect(() => {
        loadLogs();
    }, []);

    // Load logs
    const loadLogs = () => {
        const allLogs = getAuditLogs();
        setLogs(allLogs);
        setFilteredLogs(allLogs);
    };

    // Apply filters
    useEffect(() => {
        let filtered = [...logs];

        // Category filter
        if (categoryFilter !== "all") {
            filtered = filtered.filter(log => log.action.startsWith(categoryFilter + "."));
        }

        // Date filter
        if (dateFilter !== "all") {
            const now = new Date();
            const filterDate = new Date();

            switch (dateFilter) {
                case "today":
                    filterDate.setHours(0, 0, 0, 0);
                    break;
                case "week":
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case "month":
                    filterDate.setMonth(now.getMonth() - 1);
                    break;
            }

            filtered = filtered.filter(log => new Date(log.timestamp) >= filterDate);
        }

        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(log =>
                log.user?.name?.toLowerCase().includes(searchLower) ||
                log.user?.email?.toLowerCase().includes(searchLower) ||
                log.action.toLowerCase().includes(searchLower) ||
                JSON.stringify(log.details).toLowerCase().includes(searchLower)
            );
        }

        setFilteredLogs(filtered);
    }, [logs, categoryFilter, dateFilter, searchTerm]);

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

    // Handle clear logs
    const handleClearLogs = () => {
        if (confirm("Êtes-vous sûr de vouloir supprimer tous les logs? Cette action est irréversible.")) {
            clearAuditLogs();
            loadLogs();
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Logs d'Audit</h1>
                    <p className="text-slate-500 mt-1">Historique complet des actions système</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleClearLogs} className="gap-2 text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                        Vider
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="border-none shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Logs</p>
                                <h3 className="text-2xl font-bold text-slate-900">{logs.length}</h3>
                            </div>
                            <Database className="h-8 w-8 text-slate-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Aujourd'hui</p>
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {logs.filter(l => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        return new Date(l.timestamp) >= today;
                                    }).length}
                                </h3>
                            </div>
                            <Shield className="h-8 w-8 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Cette semaine</p>
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {logs.filter(l => {
                                        const weekAgo = new Date();
                                        weekAgo.setDate(weekAgo.getDate() - 7);
                                        return new Date(l.timestamp) >= weekAgo;
                                    }).length}
                                </h3>
                            </div>
                            <FileText className="h-8 w-8 text-emerald-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Échecs connexion</p>
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {logs.filter(l => l.action === 'auth.login_failed').length}
                                </h3>
                            </div>
                            <AlertCircle className="h-8 w-8 text-red-400" />
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
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes catégories</SelectItem>
                                <SelectItem value="auth">Authentification</SelectItem>
                                <SelectItem value="user">Utilisateurs</SelectItem>
                                <SelectItem value="student">Étudiants</SelectItem>
                                <SelectItem value="invoice">Factures</SelectItem>
                                <SelectItem value="system">Système</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Date Filter */}
                        <Select value={dateFilter} onValueChange={setDateFilter}>
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
                    <CardTitle>Logs ({filteredLogs.length})</CardTitle>
                    <CardDescription>Historique des actions système</CardDescription>
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
                                {filteredLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                                            Aucun log trouvé
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-sm text-slate-600">
                                                {formatDate(log.timestamp, 'datetime')}
                                            </TableCell>
                                            <TableCell>{getActionBadge(log.action)}</TableCell>
                                            <TableCell className="font-medium">{getActionDescription(log)}</TableCell>
                                            <TableCell>
                                                {log.user ? (
                                                    <div>
                                                        <p className="font-medium text-sm">{log.user.name}</p>
                                                        <p className="text-xs text-slate-500">{log.user.email}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-sm">Système</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600 max-w-xs truncate">
                                                {JSON.stringify(log.details)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
