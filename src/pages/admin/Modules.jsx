import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import moduleService from "@/services/moduleService";
import formationService from "@/services/formationService";
import { Button } from "@/components/ui/button";
import {
    Card, CardContent
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Edit, Trash2, MoreVertical, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import DataTable from "@/components/ui/data-table";
import ModuleFormDialog from "@/components/modules/ModuleFormDialog";
import { toast } from "sonner";
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

export default function Modules() {
    const { t } = useTranslation();
    const [showForm, setShowForm] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
    const [viewModule, setViewModule] = useState(null);

    const queryClient = useQueryClient();

    const { data: modules = [], isLoading } = useQuery({
        queryKey: ["modules"],
        queryFn: moduleService.getAll,
    });

    const { data: formations = [] } = useQuery({
        queryKey: ["formations"],
        queryFn: formationService.getAll,
    });

    const deleteModuleMutation = useMutation({
        mutationFn: (id) => moduleService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["modules"] });
            Swal.fire(
                'Supprimé !',
                'Le module a été supprimé.',
                'success'
            );
        },
        onError: (error) => {
            console.error(error);
            Swal.fire(
                'Erreur',
                'Une erreur est survenue lors de la suppression.',
                'error'
            );
        }
    });

    const filteredModules = modules;

    const getFormationName = (module) => {
        // API returns formation object with title
        if (module.formation && module.formation.title) {
            return module.formation.title;
        }
        // Fallback to formation_id lookup
        if (module.formation_id) {
            return formations.find((f) => f.id === module.formation_id)?.title || "Formation inconnue";
        }
        return "Formation inconnue";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900">{t('modules.title')}</h1>
                    <p className="text-slate-600 mt-1">{t('modules.subtitle')}</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingModule(null);
                        setShowForm(true);
                    }}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('modules.addModule')}
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-red-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                        <BookOpen className="h-32 w-32 text-red-600" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl text-white shadow-lg shadow-red-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">{t('common.total')}</span>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-semibold mb-1">{t('modules.stats.totalModules')}</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{modules.length}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-emerald-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                        <BookOpen className="h-32 w-32 text-emerald-600" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">{t('formations.title')}</span>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-semibold mb-1">{t('modules.stats.activeFormations')}</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{formations.length}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-blue-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                        <BookOpen className="h-32 w-32 text-blue-600" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">{t('modules.hours')}</span>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-semibold mb-1">{t('modules.stats.totalHours')}</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{modules.reduce((sum, m) => sum + (m.hours || 0), 0)}h</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                        </div>
                    ) : (
                        <DataTable
                            data={filteredModules}
                            columns={[
                                {
                                    key: 'title',
                                    label: 'Titre',
                                    sortable: true,
                                },
                                {
                                    key: 'formation',
                                    label: 'Formation',
                                    sortable: true,
                                    render: (mod) => (
                                        <Badge variant="outline" className="bg-red-50">
                                            {getFormationName(mod)}
                                        </Badge>
                                    ),
                                },
                                {
                                    key: 'hours',
                                    label: 'Heures',
                                    sortable: true,
                                    render: (mod) => `${mod.hours}h`,
                                },
                                {
                                    key: 'description',
                                    label: 'Description',
                                    sortable: false,
                                    render: (mod) => (
                                        <span className="max-w-xs truncate block">{mod.description}</span>
                                    ),
                                },
                                {
                                    key: 'actions',
                                    label: 'Actions',
                                    sortable: false,
                                    searchable: false,
                                    render: (mod) => (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setEditingModule(mod);
                                                        setShowForm(true);
                                                    }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                    Modifier
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        Swal.fire({
                                                            title: 'Êtes-vous sûr ?',
                                                            text: "Voulez-vous vraiment supprimer ce module ?",
                                                            icon: 'warning',
                                                            showCancelButton: true,
                                                            confirmButtonColor: '#d33',
                                                            cancelButtonColor: '#3085d6',
                                                            confirmButtonText: 'Oui, supprimer',
                                                            cancelButtonText: 'Annuler'
                                                        }).then((result) => {
                                                            if (result.isConfirmed) {
                                                                deleteModuleMutation.mutate(mod.id);
                                                            }
                                                        });
                                                    }}
                                                    className="flex items-center gap-2 text-red-600 focus:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Supprimer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ),
                                },
                            ]}
                            searchable={true}
                            defaultPageSize={10}
                            pageSizeOptions={[10, 25, 50, 100]}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            {showForm && (
                <ModuleFormDialog
                    module={editingModule}
                    formations={formations}
                    open={showForm}
                    onClose={() => {
                        setShowForm(false);
                        setEditingModule(null);
                    }}
                />
            )}
        </div>
    );
}
