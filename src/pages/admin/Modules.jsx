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

export default function Modules() {
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
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-black">Modules</h1>
                <Button
                    onClick={() => {
                        setEditingModule(null);
                        setShowForm(true);
                    }}
                    className="bg-red-600 hover:bg-red-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau Module
                </Button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-lg bg-red-50">
                    <CardContent className="p-6 flex justify-between">
                        <div>
                            <p className="text-sm text-red-700">Total Modules</p>
                            <h3 className="text-3xl font-bold text-red-900">{modules.length}</h3>
                        </div>
                        <div className="p-3 bg-red-600 rounded-xl">
                            <BookOpen className="text-white" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-green-50">
                    <CardContent className="p-6 flex justify-between">
                        <div>
                            <p className="text-sm text-green-700">Formations</p>
                            <h3 className="text-3xl font-bold text-green-900">{formations.length}</h3>
                        </div>
                        <div className="p-3 bg-green-600 rounded-xl">
                            <BookOpen className="text-white" />
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
