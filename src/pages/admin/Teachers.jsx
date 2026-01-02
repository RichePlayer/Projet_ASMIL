
// src/pages/Teachers.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Plus, Users, Edit, Trash2, Eye, MoreVertical, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import DataTable from "@/components/ui/data-table";
import TeacherFormDialog from "@/components/teachers/TeacherFormDialog";
import TeacherDetailDialog from "@/components/teachers/TeacherDetailDialog";
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

export default function Teachers() {
    const { t } = useTranslation();
    const [statusFilter, setStatusFilter] = useState("all");
    const [showForm, setShowForm] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [viewingTeacher, setViewingTeacher] = useState(null);

    const queryClient = useQueryClient();

    const { data: teachersData, isLoading } = useQuery({
        queryKey: ["teachers"],
        queryFn: async () => {
            const response = await api.get('/teachers?limit=1000');
            return response.data.teachers || [];
        },
    });

    // Ensure teachers is always an array
    const teachers = Array.isArray(teachersData) ? teachersData : [];

    const deleteTeacherMutation = useMutation({
        mutationFn: (id) => api.delete(`/teachers/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teachers"] });
            Swal.fire(
                'Supprimé !',
                'L\'enseignant a été supprimé.',
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

    const filteredTeachers = teachers.filter((teacher) => {
        const matchesStatus = statusFilter === "all" || teacher.status === statusFilter;
        return matchesStatus;
    });

    const getStatusColor = (status) => {
        const colors = {
            actif: "bg-green-100 text-green-800 border-green-200",
            inactif: "bg-slate-100 text-slate-800 border-slate-200",
            congé: "bg-orange-100 text-orange-800 border-orange-200",
        };
        return colors[status] || "bg-slate-100 text-slate-800";
    };

    const totalActive = teachers.filter((t) => t.status === "actif").length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900">{t('teachers.title')}</h1>
                    <p className="text-slate-600 mt-1">{t('teachers.subtitle')}</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingTeacher(null);
                        setShowForm(true);
                    }}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('teachers.addTeacher')}
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-red-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                        <Users className="h-32 w-32 text-red-600" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl text-white shadow-lg shadow-red-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                <Users className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">{t('common.total')}</span>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-semibold mb-1">{t('teachers.stats.totalTeachers')}</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{teachers.length}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-emerald-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                        <Users className="h-32 w-32 text-emerald-600" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                <Users className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">{t('teachers.stats.active')}</span>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-semibold mb-1">{t('teachers.stats.active')}</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalActive}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-pink-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                        <Users className="h-32 w-32 text-pink-600" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl text-white shadow-lg shadow-pink-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                <Users className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">{t('teachers.stats.onLeave')}</span>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-semibold mb-1">{t('teachers.stats.onLeave')}</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{teachers.filter((t) => t.status === "congé").length}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {["all", "actif", "inactif", "congé"].map((status) => (
                    <Button
                        key={status}
                        variant={statusFilter === status ? "default" : "outline"}
                        onClick={() => setStatusFilter(status)}
                        className={statusFilter === status ? "bg-red-600 hover:bg-red-700" : ""}
                        size="sm"
                    >
                        {status === "all" ? "Tous" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                ))}
            </div>

            {/* Teachers Table */}
            <Card className="shadow-lg border-0">
                <CardContent className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                        </div>
                    ) : (
                        <DataTable
                            data={filteredTeachers}
                            columns={[
                                {
                                    key: 'name',
                                    label: 'Enseignant',
                                    sortable: true,
                                    render: (teacher) => (
                                        <div className="flex items-center gap-3">
                                            {teacher.photo_url ? (
                                                <img
                                                    src={teacher.photo_url}
                                                    alt={`${teacher.first_name} ${teacher.last_name}`}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold">
                                                    {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                                                </div>
                                            )}
                                            <span className="font-semibold">
                                                {teacher.first_name} {teacher.last_name}
                                            </span>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'email',
                                    label: 'Email',
                                    sortable: true,
                                },
                                {
                                    key: 'phone',
                                    label: 'Téléphone',
                                    sortable: true,
                                    render: (teacher) => teacher.phone || "-",
                                },
                                {
                                    key: 'specialties',
                                    label: 'Spécialités',
                                    sortable: false,
                                    searchable: false,
                                    render: (teacher) => (
                                        <div className="flex gap-1 flex-wrap">
                                            {teacher.specialties?.slice(0, 2).map((spec, idx) => (
                                                <Badge key={idx} variant="outline" className="text-xs">
                                                    {spec}
                                                </Badge>
                                            ))}
                                            {teacher.specialties?.length > 2 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{teacher.specialties.length - 2}
                                                </Badge>
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    key: 'status',
                                    label: 'Statut',
                                    sortable: true,
                                    render: (teacher) => (
                                        <Badge variant="outline" className={`${getStatusColor(teacher.status)} border`}>
                                            {teacher.status}
                                        </Badge>
                                    ),
                                },
                                {
                                    key: 'actions',
                                    label: 'Actions',
                                    sortable: false,
                                    searchable: false,
                                    render: (teacher) => (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-5 w-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem onClick={() => setViewingTeacher(teacher)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Voir détails
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setEditingTeacher(teacher);
                                                        setShowForm(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Modifier
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-700"
                                                    onClick={() => {
                                                        Swal.fire({
                                                            title: 'Êtes-vous sûr ?',
                                                            text: "Voulez-vous vraiment supprimer cet enseignant ?",
                                                            icon: 'warning',
                                                            showCancelButton: true,
                                                            confirmButtonColor: '#d33',
                                                            cancelButtonColor: '#3085d6',
                                                            confirmButtonText: 'Oui, supprimer',
                                                            cancelButtonText: 'Annuler'
                                                        }).then((result) => {
                                                            if (result.isConfirmed) {
                                                                deleteTeacherMutation.mutate(teacher.id);
                                                            }
                                                        });
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
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
                <TeacherFormDialog
                    teacher={editingTeacher}
                    open={showForm}
                    onClose={() => {
                        setShowForm(false);
                        setEditingTeacher(null);
                    }}
                />
            )}

            {viewingTeacher && (
                <TeacherDetailDialog
                    teacher={viewingTeacher}
                    open={!!viewingTeacher}
                    onClose={() => setViewingTeacher(null)}
                    onEdit={() => {
                        setEditingTeacher(viewingTeacher);
                        setShowForm(true);
                        setViewingTeacher(null);
                    }}
                />
            )}
        </div>
    );
}
