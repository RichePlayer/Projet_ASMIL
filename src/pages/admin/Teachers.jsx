
// src/pages/Teachers.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, Edit, Trash2, Eye, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import TeacherFormDialog from "@/components/teachers/TeacherFormDialog";
import TeacherDetailDialog from "@/components/teachers/TeacherDetailDialog";
import Swal from 'sweetalert2';

export default function Teachers() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showForm, setShowForm] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [viewingTeacher, setViewingTeacher] = useState(null);

    const queryClient = useQueryClient();

    const { data: teachers = [], isLoading } = useQuery({
        queryKey: ["teachers"],
        queryFn: async () => {
            const response = await api.get('/teachers?limit=1000');
            return response.data.teachers || [];
        },
    });

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
        const matchesSearch =
            teacher.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            teacher.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (teacher.email || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || teacher.status === statusFilter;
        return matchesSearch && matchesStatus;
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
                    <h1 className="text-4xl font-black text-slate-900">Enseignants</h1>
                    <p className="text-slate-600 mt-1">Gérez votre équipe pédagogique</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingTeacher(null);
                        setShowForm(true);
                    }}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvel Enseignant
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-red-100">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-700">Total Enseignants</p>
                                <h3 className="text-3xl font-bold text-red-900 mt-2">{teachers.length}</h3>
                            </div>
                            <div className="p-3 rounded-xl bg-red-600 shadow-lg">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700">Actifs</p>
                                <h3 className="text-3xl font-bold text-green-900 mt-2">{totalActive}</h3>
                            </div>
                            <div className="p-3 rounded-xl bg-green-600 shadow-lg">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700">En Congé</p>
                                <h3 className="text-3xl font-bold text-blue-900 mt-2">
                                    {teachers.filter((t) => t.status === "congé").length}
                                </h3>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-600 shadow-lg">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Rechercher un enseignant..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
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
            </div>

            {/* Teachers Table */}
            <Card className="shadow-lg border-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="font-bold">Enseignant</TableHead>
                            <TableHead className="font-bold">Email</TableHead>
                            <TableHead className="font-bold">Téléphone</TableHead>
                            <TableHead className="font-bold">Spécialités</TableHead>
                            <TableHead className="font-bold">Statut</TableHead>
                            <TableHead className="font-bold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                    Chargement...
                                </TableCell>
                            </TableRow>
                        ) : filteredTeachers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                    Aucun enseignant trouvé
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTeachers.map((teacher) => (
                                <TableRow key={teacher.id} className="hover:bg-slate-50 transition-colors">
                                    <TableCell>
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
                                    </TableCell>
                                    <TableCell className="text-slate-600">{teacher.email}</TableCell>
                                    <TableCell className="text-slate-600">{teacher.phone || "-"}</TableCell>
                                    <TableCell>
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
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`${getStatusColor(teacher.status)} border`}>
                                            {teacher.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
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
                                    </TableCell>

                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
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
