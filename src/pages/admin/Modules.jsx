import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import moduleService from "@/services/moduleService";
import formationService from "@/services/formationService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card, CardContent
} from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, BookOpen, Edit, Trash2, Clock, MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import ModuleFormDialog from "@/components/modules/ModuleFormDialog";
import { toast } from "sonner";

export default function Modules() {
    const [searchQuery, setSearchQuery] = useState("");
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
            toast.success("Module supprimé");
        },
    });

    const filteredModules = modules.filter((mod) =>
        mod.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                    className="pl-10"
                    placeholder="Rechercher un module..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Table */}
            <Card className="shadow-lg border-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead>Titre</TableHead>
                            <TableHead>Formation</TableHead>
                            <TableHead>Heures</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    Chargement...
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredModules.map((mod) => (
                                <TableRow key={mod.id}>
                                    <TableCell className="font-medium">{mod.title}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-red-50">
                                            {getFormationName(mod)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{mod.hours}h</TableCell>
                                    <TableCell className="max-w-xs truncate">{mod.description}</TableCell>
                                    <TableCell className="text-right">
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
                                                        if (confirm("Supprimer ce module ?")) {
                                                            deleteModuleMutation.mutate(mod.id);
                                                        }
                                                    }}
                                                    className="flex items-center gap-2 text-red-600 focus:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
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
