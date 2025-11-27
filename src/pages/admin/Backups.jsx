// src/pages/admin/Backups.jsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useAuditLog } from "@/hooks/useAuditLog";
import { LOG_ACTIONS } from "@/utils/auditLog";
import { downloadJSON, readJSONFile, formatDate } from "@/utils/exportHelpers";
import {
    Download,
    Upload,
    Database,
    CheckCircle2,
    AlertCircle,
    Clock,
    HardDrive,
    RefreshCw
} from "lucide-react";

// Mock backup history
const MOCK_BACKUPS = [
    {
        id: 1,
        filename: "backup_2025-11-27_10-30.json",
        date: "2025-11-27T10:30:00",
        size: "2.4 MB",
        status: "success",
        type: "auto",
    },
    {
        id: 2,
        filename: "backup_2025-11-26_10-30.json",
        date: "2025-11-26T10:30:00",
        size: "2.3 MB",
        status: "success",
        type: "auto",
    },
    {
        id: 3,
        filename: "backup_2025-11-25_15-45.json",
        date: "2025-11-25T15:45:00",
        size: "2.2 MB",
        status: "success",
        type: "manual",
    },
];

export default function Backups() {
    const { log } = useAuditLog();
    const [backups, setBackups] = useState(MOCK_BACKUPS);
    const [isCreating, setIsCreating] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    // Create backup
    const handleCreateBackup = () => {
        setIsCreating(true);

        // Simulate backup creation
        setTimeout(() => {
            // Collect all data from localStorage
            const backupData = {
                version: "1.0.0",
                timestamp: new Date().toISOString(),
                data: {
                    students: JSON.parse(localStorage.getItem('students') || '[]'),
                    teachers: JSON.parse(localStorage.getItem('teachers') || '[]'),
                    invoices: JSON.parse(localStorage.getItem('invoices') || '[]'),
                    payments: JSON.parse(localStorage.getItem('payments') || '[]'),
                    enrollments: JSON.parse(localStorage.getItem('enrollments') || '[]'),
                    formations: JSON.parse(localStorage.getItem('formations') || '[]'),
                    modules: JSON.parse(localStorage.getItem('modules') || '[]'),
                    sessions: JSON.parse(localStorage.getItem('sessions') || '[]'),
                    grades: JSON.parse(localStorage.getItem('grades') || '[]'),
                    attendance: JSON.parse(localStorage.getItem('attendance') || '[]'),
                    certificates: JSON.parse(localStorage.getItem('certificates') || '[]'),
                    announcements: JSON.parse(localStorage.getItem('announcements') || '[]'),
                    audit_logs: JSON.parse(localStorage.getItem('asmil_audit_logs') || '[]'),
                },
            };

            // Download backup file
            const filename = `backup_${new Date().toISOString().split('T')[0]}_${new Date().toTimeString().split(' ')[0].replace(/:/g, '-')}.json`;
            downloadJSON(backupData, filename);

            // Add to backup history
            const newBackup = {
                id: backups.length + 1,
                filename,
                date: new Date().toISOString(),
                size: `${(JSON.stringify(backupData).length / 1024 / 1024).toFixed(1)} MB`,
                status: "success",
                type: "manual",
            };
            setBackups([newBackup, ...backups]);

            // Log action
            log(LOG_ACTIONS.BACKUP_CREATE, { filename });

            setIsCreating(false);
            alert("Sauvegarde créée avec succès!");
        }, 1500);
    };

    // Restore backup
    const handleRestoreBackup = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!confirm("Êtes-vous sûr de vouloir restaurer cette sauvegarde? Toutes les données actuelles seront remplacées.")) {
            event.target.value = '';
            return;
        }

        setIsRestoring(true);

        try {
            const backupData = await readJSONFile(file);

            // Validate backup structure
            if (!backupData.version || !backupData.data) {
                throw new Error("Format de sauvegarde invalide");
            }

            // Restore data to localStorage
            Object.entries(backupData.data).forEach(([key, value]) => {
                if (key === 'audit_logs') {
                    localStorage.setItem('asmil_audit_logs', JSON.stringify(value));
                } else {
                    localStorage.setItem(key, JSON.stringify(value));
                }
            });

            // Log action
            log(LOG_ACTIONS.BACKUP_RESTORE, { filename: file.name });

            alert("Sauvegarde restaurée avec succès! La page va se recharger.");

            // Reload page to reflect changes
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            alert(`Erreur lors de la restauration: ${error.message}`);
        } finally {
            setIsRestoring(false);
            event.target.value = '';
        }
    };

    // Download existing backup
    const handleDownloadBackup = (backup) => {
        // In a real app, this would download from server
        alert(`Téléchargement de ${backup.filename}...`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Sauvegardes</h1>
                    <p className="text-slate-500 mt-1">Gérer les sauvegardes et restaurations du système</p>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Create Backup */}
                <Card className="border-none shadow-md bg-gradient-to-br from-emerald-50 to-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-900">
                            <Database className="h-5 w-5" />
                            Créer une Sauvegarde
                        </CardTitle>
                        <CardDescription>Exporter toutes les données du système</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={handleCreateBackup}
                            disabled={isCreating}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
                        >
                            {isCreating ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    Création en cours...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4" />
                                    Créer Sauvegarde
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-slate-500 mt-3">
                            Crée un fichier JSON contenant toutes les données du système (étudiants, factures, logs, etc.)
                        </p>
                    </CardContent>
                </Card>

                {/* Restore Backup */}
                <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-900">
                            <Upload className="h-5 w-5" />
                            Restaurer une Sauvegarde
                        </CardTitle>
                        <CardDescription>Importer des données depuis un fichier</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Label htmlFor="restore-file" className="cursor-pointer">
                            <div className={`w-full border-2 border-dashed rounded-lg p-4 text-center transition-colors ${isRestoring ? 'border-blue-300 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                                }`}>
                                {isRestoring ? (
                                    <div className="flex items-center justify-center gap-2 text-blue-600">
                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                        <span>Restauration en cours...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <Upload className="h-8 w-8 text-blue-600" />
                                        <span className="text-sm font-medium text-slate-700">Cliquer pour sélectionner un fichier</span>
                                        <span className="text-xs text-slate-500">Fichier JSON uniquement</span>
                                    </div>
                                )}
                            </div>
                        </Label>
                        <Input
                            id="restore-file"
                            type="file"
                            accept=".json"
                            onChange={handleRestoreBackup}
                            disabled={isRestoring}
                            className="hidden"
                        />
                        <p className="text-xs text-red-600 mt-3 font-medium">
                            ⚠️ Attention: Cette action remplacera toutes les données actuelles
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* System Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-none shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Dernière sauvegarde</p>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {backups.length > 0 ? formatDate(backups[0].date, 'datetime') : 'Jamais'}
                                </h3>
                            </div>
                            <Clock className="h-8 w-8 text-blue-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total sauvegardes</p>
                                <h3 className="text-lg font-bold text-slate-900">{backups.length}</h3>
                            </div>
                            <Database className="h-8 w-8 text-emerald-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Espace utilisé</p>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {backups.reduce((sum, b) => sum + parseFloat(b.size), 0).toFixed(1)} MB
                                </h3>
                            </div>
                            <HardDrive className="h-8 w-8 text-violet-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Backup History */}
            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle>Historique des Sauvegardes</CardTitle>
                    <CardDescription>Liste des sauvegardes récentes</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fichier</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Taille</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {backups.map((backup) => (
                                    <TableRow key={backup.id}>
                                        <TableCell className="font-medium font-mono text-sm">{backup.filename}</TableCell>
                                        <TableCell className="text-slate-600">{formatDate(backup.date, 'datetime')}</TableCell>
                                        <TableCell className="text-slate-600">{backup.size}</TableCell>
                                        <TableCell>
                                            <Badge className={backup.type === 'auto' ? 'bg-blue-100 text-blue-700 border-blue-200 border' : 'bg-violet-100 text-violet-700 border-violet-200 border'}>
                                                {backup.type === 'auto' ? 'Automatique' : 'Manuelle'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {backup.status === 'success' ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border flex items-center gap-1 w-fit">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Succès
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-red-100 text-red-700 border-red-200 border flex items-center gap-1 w-fit">
                                                    <AlertCircle className="h-3 w-3" />
                                                    Échec
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDownloadBackup(backup)}
                                                className="gap-2"
                                            >
                                                <Download className="h-4 w-4" />
                                                Télécharger
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="border-none shadow-md bg-blue-50">
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <AlertCircle className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-2">Bonnes Pratiques</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Créez des sauvegardes régulières (recommandé: quotidien)</li>
                                <li>• Stockez les sauvegardes dans un endroit sûr (cloud, disque externe)</li>
                                <li>• Testez vos sauvegardes périodiquement</li>
                                <li>• Conservez plusieurs versions de sauvegardes</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
