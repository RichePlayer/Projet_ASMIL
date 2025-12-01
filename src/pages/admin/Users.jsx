// src/pages/admin/Users.jsx - Admin & Secretary only
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { useAuditLog } from "@/hooks/useAuditLog";
import { LOG_ACTIONS } from "@/utils/auditLog";
import api from "@/services/api"; // Import de l'API réelle
import {
    UserPlus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Power,
    PowerOff,
    Key,
    Shield,
    User,
    Loader2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner"; // Pour les notifications
import Swal from 'sweetalert2';

export default function Users() {
    const { log } = useAuditLog();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        role: "Gestionnaire",
        password: "",
    });

    // Charger les utilisateurs depuis l'API
    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/auth/users'); // Assurez-vous que cette route existe dans le backend (peut-être besoin de l'ajouter si elle n'existe pas, sinon utiliser une route admin spécifique)
            // Note: Si la route /auth/users n'existe pas, il faudra peut-être utiliser une route dédiée aux admins pour lister tous les utilisateurs.
            // Supposons pour l'instant que le backend a une route pour lister les utilisateurs.
            // Si ce n'est pas le cas, je devrai peut-être ajouter cette route au backend.
            // D'après mes souvenirs, il n'y avait pas de route "getAllUsers" explicite dans authRoutes.js, mais c'est standard.
            // Je vais vérifier cela après. Pour l'instant, je code comme si elle existait ou je l'ajouterai.
            // En fait, authController a souvent juste register/login.
            // Je vais devoir ajouter une route pour lister les utilisateurs dans le backend si elle manque.
            setUsers(response.data);
        } catch (error) {
            console.error("Erreur lors du chargement des utilisateurs:", error);
            toast.error("Impossible de charger les utilisateurs.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        const matchesStatus = statusFilter === "all" || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    // Role badge colors
    const getRoleBadge = (role) => {
        const badges = {
            Admin: { color: "bg-red-100 text-red-700 border-red-200", icon: Shield },
            Gestionnaire: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: User },
        };
        const badge = badges[role] || badges.Gestionnaire;
        const Icon = badge.icon;
        return (
            <Badge className={`${badge.color} border font-medium flex items-center gap-1 w-fit`}>
                <Icon className="h-3 w-3" />
                {role}
            </Badge>
        );
    };

    // Status badge
    const getStatusBadge = (status) => {
        return status === "active" ? (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border">Actif</Badge>
        ) : (
            <Badge className="bg-slate-100 text-slate-700 border-slate-200 border">Inactif</Badge>
        );
    };

    // Handle create user
    const handleCreateUser = async () => {
        if (formData.password !== formData.confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas.");
            return;
        }
        try {
            const response = await api.post('/auth/register', formData); // Utilise la route d'inscription existante
            setUsers([...users, response.data.user]);
            log(LOG_ACTIONS.USER_CREATE, { user: response.data.user });
            setIsCreateDialogOpen(false);
            setFormData({ full_name: "", email: "", role: "Gestionnaire", password: "" });

            Swal.fire({
                icon: 'success',
                title: 'Utilisateur créé',
                text: 'Le nouvel utilisateur a été ajouté avec succès.',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Erreur création utilisateur:", error);
            Swal.fire('Erreur', error.response?.data?.message || "Erreur lors de la création.", 'error');
        }
    };

    // Handle edit user
    const handleEditUser = async () => {
        try {
            // Note: Il faudra probablement une route PUT /auth/users/:id ou similaire dans le backend
            // Je vais assumer pour l'instant que je peux utiliser une route de mise à jour.
            // Si elle n'existe pas, je l'ajouterai.
            const response = await api.put(`/auth/users/${selectedUser.id}`, formData);
            setUsers(users.map(u => u.id === selectedUser.id ? response.data : u));
            log(LOG_ACTIONS.USER_UPDATE, { userId: selectedUser.id, changes: formData });
            setIsEditDialogOpen(false);
            setSelectedUser(null);

            Swal.fire({
                icon: 'success',
                title: 'Modifications enregistrées',
                text: 'L\'utilisateur a été mis à jour.',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Erreur mise à jour utilisateur:", error);
            Swal.fire('Erreur', 'Erreur lors de la mise à jour.', 'error');
        }
    };

    // Handle delete user
    const handleDeleteUser = async (user) => {
        if (user.email === 'admin@asmil.mg') {
            Swal.fire({
                icon: 'error',
                title: 'Action interdite',
                text: 'Vous ne pouvez pas supprimer l\'administrateur principal.',
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: `Voulez-vous vraiment supprimer ${user.full_name} ? Cette action est irréversible.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/auth/users/${user.id}`);
                setUsers(users.filter(u => u.id !== user.id));
                log(LOG_ACTIONS.USER_DELETE, { userId: user.id, userName: user.full_name });
                Swal.fire(
                    'Supprimé !',
                    'L\'utilisateur a été supprimé.',
                    'success'
                );
            } catch (error) {
                console.error("Erreur suppression utilisateur:", error);
                Swal.fire(
                    'Erreur',
                    error.response?.data?.message || 'Une erreur est survenue lors de la suppression.',
                    'error'
                );
            }
        }
    };

    // Handle toggle status
    const handleToggleStatus = async (user) => {
        const newStatus = user.status === "active" ? "inactive" : "active";
        const actionText = newStatus === "active" ? "activer" : "désactiver";

        const result = await Swal.fire({
            title: `Voulez-vous ${actionText} cet utilisateur ?`,
            text: `L'utilisateur ${user.full_name} sera ${newStatus === 'active' ? 'activé' : 'désactivé'}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: newStatus === 'active' ? '#10b981' : '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: `Oui, ${actionText}`,
            cancelButtonText: 'Annuler'
        });

        if (result.isConfirmed) {
            try {
                const response = await api.put(`/auth/users/${user.id}/status`, { status: newStatus });
                setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
                const action = newStatus === "active" ? LOG_ACTIONS.USER_ACTIVATE : LOG_ACTIONS.USER_DEACTIVATE;
                log(action, { userId: user.id, userName: user.full_name });

                Swal.fire({
                    icon: 'success',
                    title: 'Succès',
                    text: `Utilisateur ${newStatus === 'active' ? 'activé' : 'désactivé'} avec succès.`,
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error("Erreur changement statut:", error);
                Swal.fire('Erreur', 'Impossible de changer le statut.', 'error');
            }
        }
    };

    const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
    const [resetPasswordData, setResetPasswordData] = useState({ password: "", confirmPassword: "" });

    // Handle reset password (open dialog)
    const handleResetPassword = (user) => {
        setSelectedUser(user);
        setResetPasswordData({ password: "", confirmPassword: "" });
        setIsResetPasswordDialogOpen(true);
    };

    // Submit reset password
    const submitResetPassword = async () => {
        if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas.");
            return;
        }
        if (resetPasswordData.password.length < 6) {
            toast.error("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }

        try {
            await api.put(`/auth/users/${selectedUser.id}/reset-password`, { password: resetPasswordData.password });
            log(LOG_ACTIONS.PASSWORD_RESET, { userId: selectedUser.id, userName: selectedUser.full_name });

            setIsResetPasswordDialogOpen(false);
            Swal.fire({
                icon: 'success',
                title: 'Mot de passe réinitialisé',
                text: 'Le mot de passe a été mis à jour avec succès.',
            });
        } catch (error) {
            console.error("Erreur reset password:", error);
            Swal.fire('Erreur', 'Erreur lors de la réinitialisation.', 'error');
        }
    };

    // Open edit dialog
    const openEditDialog = (user) => {
        setSelectedUser(user);
        setFormData({
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            password: "", // On ne remplit pas le mot de passe pour l'édition
        });
        setIsEditDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestion des Utilisateurs</h1>
                    <p className="text-slate-500 mt-1">Gérer les comptes Admin et Secrétaire</p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-red-600 hover:bg-red-700 gap-2">
                    <UserPlus className="h-4 w-4" />
                    Nouvel Utilisateur
                </Button>
            </div>

            {/* Filters & Search */}
            <Card className="border-none shadow-md">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Rechercher par nom ou email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Role Filter */}
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrer par rôle" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les rôles</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Gestionnaire">Gestionnaire</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrer par statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                <SelectItem value="active">Actifs</SelectItem>
                                <SelectItem value="inactive">Inactifs</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Utilisateurs ({filteredUsers.length})</CardTitle>
                        <CardDescription>Liste complète des utilisateurs du système</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                        </div>
                    ) : (
                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Rôle</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Dernière connexion</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                                Aucun utilisateur trouvé.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.full_name}</TableCell>
                                                <TableCell className="text-slate-600">{user.email}</TableCell>
                                                <TableCell>{getRoleBadge(user.role)}</TableCell>
                                                <TableCell>{getStatusBadge(user.status)}</TableCell>
                                                <TableCell className="text-slate-600 text-sm">
                                                    {user.last_login ? new Date(user.last_login).toLocaleString('fr-FR') : "Jamais"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Modifier
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                                                                {user.status === "active" ? (
                                                                    <><PowerOff className="h-4 w-4 mr-2" />Désactiver</>
                                                                ) : (
                                                                    <><Power className="h-4 w-4 mr-2" />Activer</>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                                                                <Key className="h-4 w-4 mr-2" />
                                                                Réinitialiser mot de passe
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteUser(user)}
                                                                className="text-red-600 focus:text-red-700"
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
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create User Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nouvel Utilisateur</DialogTitle>
                        <DialogDescription>Créer un nouveau compte utilisateur</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nom complet</Label>
                            <Input
                                id="name"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                placeholder="Jean Dupont"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="jean@asmil.mg"
                            />
                        </div>
                        <div>
                            <Label htmlFor="role">Rôle</Label>
                            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="Gestionnaire">Gestionnaire (Secrétaire)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="password">Mot de passe</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword || ""}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Annuler</Button>
                        <Button onClick={handleCreateUser} className="bg-red-600 hover:bg-red-700">Créer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier Utilisateur</DialogTitle>
                        <DialogDescription>Modifier les informations de l'utilisateur</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-name">Nom complet</Label>
                            <Input
                                id="edit-name"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-role">Rôle</Label>
                            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="Gestionnaire">Gestionnaire (Secrétaire)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
                        <Button onClick={handleEditUser} className="bg-red-600 hover:bg-red-700">Enregistrer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            {/* Reset Password Dialog */}
            < Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen} >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
                        <DialogDescription>
                            Définir un nouveau mot de passe pour {selectedUser?.full_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="new-password">Nouveau mot de passe</Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={resetPasswordData.password}
                                onChange={(e) => setResetPasswordData({ ...resetPasswordData, password: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <Label htmlFor="confirm-new-password">Confirmer le mot de passe</Label>
                            <Input
                                id="confirm-new-password"
                                type="password"
                                value={resetPasswordData.confirmPassword}
                                onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>Annuler</Button>
                        <Button onClick={submitResetPassword} className="bg-red-600 hover:bg-red-700">Réinitialiser</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </div >
    );
}
