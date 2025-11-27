// src/pages/admin/Users.jsx - Admin & Secretary only
import React, { useState } from "react";
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
import ExportButton from "@/components/shared/ExportButton";
import { useAuditLog } from "@/hooks/useAuditLog";
import { LOG_ACTIONS } from "@/utils/auditLog";
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
    User
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Mock users data - Admin and Secretary only
const MOCK_USERS = [
    {
        id: 1,
        full_name: "Administrateur",
        email: "admin@asmil.mg",
        role: "Admin",
        status: "active",
        created_date: "2024-01-15",
        last_login: "2025-11-27T10:30:00",
    },
    {
        id: 2,
        full_name: "Secrétaire Principale",
        email: "secretaire@asmil.mg",
        role: "Gestionnaire",
        status: "active",
        created_date: "2024-01-15",
        last_login: "2025-11-27T09:15:00",
    },
    {
        id: 3,
        full_name: "Marie Rasoamalala",
        email: "marie@asmil.mg",
        role: "Gestionnaire",
        status: "inactive",
        created_date: "2024-03-10",
        last_login: "2025-10-15T11:00:00",
    },
];

export default function Users() {
    const { log } = useAuditLog();
    const [users, setUsers] = useState(MOCK_USERS);
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

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        const matchesStatus = statusFilter === "all" || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    // Role badge colors - Only Admin and Gestionnaire
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
    const handleCreateUser = () => {
        const newUser = {
            id: users.length + 1,
            ...formData,
            status: "active",
            created_date: new Date().toISOString().split('T')[0],
            last_login: null,
        };
        setUsers([...users, newUser]);
        log(LOG_ACTIONS.USER_CREATE, { user: newUser });
        setIsCreateDialogOpen(false);
        setFormData({ full_name: "", email: "", role: "Gestionnaire", password: "" });
    };

    // Handle edit user
    const handleEditUser = () => {
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...formData } : u));
        log(LOG_ACTIONS.USER_UPDATE, { userId: selectedUser.id, changes: formData });
        setIsEditDialogOpen(false);
        setSelectedUser(null);
    };

    // Handle delete user
    const handleDeleteUser = (user) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer ${user.full_name}?`)) {
            setUsers(users.filter(u => u.id !== user.id));
            log(LOG_ACTIONS.USER_DELETE, { userId: user.id, userName: user.full_name });
        }
    };

    // Handle toggle status
    const handleToggleStatus = (user) => {
        const newStatus = user.status === "active" ? "inactive" : "active";
        setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        const action = newStatus === "active" ? LOG_ACTIONS.USER_ACTIVATE : LOG_ACTIONS.USER_DEACTIVATE;
        log(action, { userId: user.id, userName: user.full_name });
    };

    // Handle reset password
    const handleResetPassword = (user) => {
        if (confirm(`Réinitialiser le mot de passe de ${user.full_name}?`)) {
            log(LOG_ACTIONS.PASSWORD_RESET, { userId: user.id, userName: user.full_name });
            alert("Un email de réinitialisation a été envoyé.");
        }
    };

    // Open edit dialog
    const openEditDialog = (user) => {
        setSelectedUser(user);
        setFormData({
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            password: "",
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
                                {filteredUsers.map((user) => (
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
                                ))}
                            </TableBody>
                        </Table>
                    </div>
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
        </div>
    );
}
