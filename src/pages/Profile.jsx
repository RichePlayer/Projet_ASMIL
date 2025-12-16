import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Lock, Bell, Shield, Mail, Phone, MapPin, Building, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import userService from "@/services/userService";
import Swal from 'sweetalert2';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const { t } = useTranslation();

    // État pour le formulaire de profil
    const [profileData, setProfileData] = useState({
        full_name: user?.full_name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
        bio: user?.bio || "",
        office: user?.office || ""
    });

    // État pour le changement de mot de passe
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Mutation pour la mise à jour du profil
    const updateProfileMutation = useMutation({
        mutationFn: (data) => userService.updateProfile(user.id, data),
        onSuccess: (response) => {
            updateUser(response.user);
            Swal.fire({
                icon: 'success',
                title: t('messages.profileUpdated'),
                text: t('messages.profileUpdatedDesc'),
                timer: 2000,
                showConfirmButton: false
            });
        },
        onError: (error) => {
            Swal.fire({
                icon: 'error',
                title: t('messages.error'),
                text: error.response?.data?.message || t('messages.error'),
            });
        }
    });

    // Mutation pour le changement de mot de passe
    const changePasswordMutation = useMutation({
        mutationFn: (data) => userService.changePassword(user.id, data.currentPassword, data.newPassword),
        onSuccess: () => {
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            Swal.fire({
                icon: 'success',
                title: t('messages.passwordChanged'),
                text: t('messages.passwordChangedDesc'),
                timer: 2000,
                showConfirmButton: false
            });
        },
        onError: (error) => {
            Swal.fire({
                icon: 'error',
                title: t('messages.error'),
                text: error.response?.data?.message || t('messages.error'),
            });
        }
    });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        updateProfileMutation.mutate(profileData);
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: t('messages.error'),
                text: t('messages.passwordMismatch'),
            });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            Swal.fire({
                icon: 'error',
                title: t('messages.error'),
                text: t('messages.passwordTooShort'),
            });
            return;
        }

        changePasswordMutation.mutate(passwordData);
    };

    // État pour l'upload d'avatar
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Mutation pour l'upload d'avatar
    const uploadAvatarMutation = useMutation({
        mutationFn: (file) => userService.uploadAvatar(user.id, file),
        onSuccess: (response) => {
            updateUser(response.user);
            setSelectedFile(null);
            setPreviewUrl(null);
            Swal.fire({
                icon: 'success',
                title: t('messages.avatarUpdated'),
                text: t('messages.avatarUpdatedDesc'),
                timer: 2000,
                showConfirmButton: false
            });
        },
        onError: (error) => {
            Swal.fire({
                icon: 'error',
                title: t('messages.error'),
                text: error.response?.data?.message || t('messages.error'),
            });
        }
    });

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Vérifier le type de fichier
            if (!file.type.startsWith('image/')) {
                Swal.fire({
                    icon: 'error',
                    title: t('messages.error'),
                    text: t('messages.invalidFileType'),
                });
                return;
            }

            // Vérifier la taille (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    icon: 'error',
                    title: t('messages.error'),
                    text: t('messages.fileTooLarge'),
                });
                return;
            }

            setSelectedFile(file);

            // Créer l'aperçu
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadAvatar = () => {
        if (selectedFile) {
            uploadAvatarMutation.mutate(selectedFile);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-8">
            {/* Header Profile */}
            <div className="relative h-48 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 overflow-hidden shadow-md">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] opacity-20 bg-cover bg-center"></div>
                <div className="absolute bottom-0 left-0 p-8 flex items-end gap-6">
                    <div className="relative group">
                        <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                            <AvatarImage src={previewUrl || (user.avatar_url ? `http://localhost:3000${user.avatar_url}` : null)} />
                            <AvatarFallback className="bg-red-600 text-white text-3xl font-bold">{user.full_name[0]}</AvatarFallback>
                        </Avatar>
                        <label
                            htmlFor="avatar-upload"
                            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </label>
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                    </div>
                    <div className="mb-2 text-white flex-1">
                        <h1 className="text-3xl font-bold">{user.full_name}</h1>
                        <p className="text-slate-300 font-medium">{user.role} • Institut ASMiL</p>
                        {selectedFile && (
                            <Button
                                onClick={handleUploadAvatar}
                                disabled={uploadAvatarMutation.isPending}
                                className="mt-2 bg-white text-slate-900 hover:bg-slate-100"
                                size="sm"
                            >
                                {uploadAvatarMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                {t('profile.uploadAvatar')}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px] bg-white border border-slate-200">
                    <TabsTrigger value="general">{t('profile.general')}</TabsTrigger>
                    <TabsTrigger value="security">{t('profile.security')}</TabsTrigger>
                    <TabsTrigger value="notifications">{t('profile.notifications')}</TabsTrigger>
                </TabsList>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-sm bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg">{t('profile.contact')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-700">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-700">{user.phone || t('profile.notProvided')}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-700">{user.address || t('profile.notProvided')}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Building className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-700">{user.office || t('profile.office')}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <TabsContent value="general" className="mt-0">
                            <Card className="border-none shadow-sm bg-white">
                                <form onSubmit={handleProfileSubmit}>
                                    <CardHeader>
                                        <CardTitle>{t('profile.personalInfo')}</CardTitle>
                                        <CardDescription>
                                            {t('profile.personalInfoDesc')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="full_name">{t('profile.fullName')}</Label>
                                            <Input
                                                id="full_name"
                                                value={profileData.full_name}
                                                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">{t('profile.email')}</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">{t('profile.phone')}</Label>
                                                <Input
                                                    id="phone"
                                                    value={profileData.phone}
                                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="office">{t('profile.office')}</Label>
                                                <Input
                                                    id="office"
                                                    value={profileData.office}
                                                    onChange={(e) => setProfileData({ ...profileData, office: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="address">{t('profile.address')}</Label>
                                            <Input
                                                id="address"
                                                value={profileData.address}
                                                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bio">{t('profile.bio')}</Label>
                                            <Input
                                                id="bio"
                                                value={profileData.bio}
                                                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            type="submit"
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                            disabled={updateProfileMutation.isPending}
                                        >
                                            {updateProfileMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                            {t('profile.saveChanges')}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security" className="mt-0">
                            <Card className="border-none shadow-sm bg-white">
                                <form onSubmit={handlePasswordSubmit}>
                                    <CardHeader>
                                        <CardTitle>{t('profile.accountSecurity')}</CardTitle>
                                        <CardDescription>
                                            {t('profile.accountSecurityDesc')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="current">{t('profile.currentPassword')}</Label>
                                            <Input
                                                id="current"
                                                type="password"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new">{t('profile.newPassword')}</Label>
                                            <Input
                                                id="new"
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirm">{t('profile.confirmPassword')}</Label>
                                            <Input
                                                id="confirm"
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            type="submit"
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                            disabled={changePasswordMutation.isPending}
                                        >
                                            {changePasswordMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                            {t('profile.updatePassword')}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>

                        <TabsContent value="notifications" className="mt-0">
                            <Card className="border-none shadow-sm bg-white">
                                <CardHeader>
                                    <CardTitle>{t('profile.notificationPreferences')}</CardTitle>
                                    <CardDescription>
                                        {t('profile.notificationPreferencesDesc')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Mock toggles */}
                                    <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">{t('profile.emailNotifications')}</Label>
                                            <p className="text-xs text-slate-500">{t('profile.emailNotificationsDesc')}</p>
                                        </div>
                                        <div className="h-6 w-11 bg-red-600 rounded-full relative cursor-pointer">
                                            <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">{t('profile.systemAlerts')}</Label>
                                            <p className="text-xs text-slate-500">{t('profile.systemAlertsDesc')}</p>
                                        </div>
                                        <div className="h-6 w-11 bg-red-600 rounded-full relative cursor-pointer">
                                            <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </div>
            </Tabs>
        </div>
    );
}
