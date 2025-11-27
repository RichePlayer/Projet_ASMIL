// src/pages/admin/SystemSettings.jsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuditLog } from "@/hooks/useAuditLog";
import { LOG_ACTIONS } from "@/utils/auditLog";
import {
    Settings,
    Palette,
    FileText,
    Bell,
    Globe,
    Shield,
    Save,
    Upload,
    AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SystemSettings() {
    const { log } = useAuditLog();

    // Settings state
    const [settings, setSettings] = useState({
        // Identity
        instituteName: "Institut ASMiL",
        instituteEmail: "contact@asmil.mg",
        institutePhone: "+261 34 00 000 00",
        instituteAddress: "Antananarivo, Madagascar",

        // Numbering
        invoicePrefix: "INV",
        invoiceStartNumber: 1,
        certificatePrefix: "CERT",
        certificateStartNumber: 1,

        // Notifications
        emailNotifications: true,
        smsNotifications: false,
        paymentReminders: true,
        reminderDaysBefore: 3,

        // System
        maintenanceMode: false,
        timezone: "Indian/Antananarivo",
        language: "fr",

        // Email Templates
        welcomeEmailTemplate: "Bienvenue à l'Institut ASMiL!\n\nNous sommes ravis de vous accueillir...",
        invoiceEmailTemplate: "Votre facture est disponible.\n\nMontant: {amount}\nÉchéance: {due_date}",
        reminderEmailTemplate: "Rappel: Votre paiement arrive à échéance le {due_date}.",
    });

    const [isSaving, setIsSaving] = useState(false);
    const [savedSection, setSavedSection] = useState(null);

    // Handle save
    const handleSave = (section) => {
        setIsSaving(true);
        setSavedSection(section);

        setTimeout(() => {
            // Save to localStorage
            localStorage.setItem('asmil_settings', JSON.stringify(settings));

            // Log action
            log(LOG_ACTIONS.SETTINGS_UPDATE, { section, settings });

            setIsSaving(false);

            // Show success message
            setTimeout(() => setSavedSection(null), 2000);
        }, 500);
    };

    // Handle logo upload
    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // In production, upload to server
            alert(`Logo "${file.name}" uploadé avec succès!`);
            log(LOG_ACTIONS.SETTINGS_UPDATE, { section: 'logo', filename: file.name });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Paramètres Système</h1>
                    <p className="text-slate-500 mt-1">Configuration et personnalisation de la plateforme</p>
                </div>
            </div>

            {/* Maintenance Mode Alert */}
            {settings.maintenanceMode && (
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                            <div>
                                <h3 className="font-semibold text-amber-900">Mode Maintenance Activé</h3>
                                <p className="text-sm text-amber-700">Le système est en mode maintenance. Seuls les administrateurs peuvent y accéder.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Identity Section */}
            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-blue-600" />
                        Identité Visuelle
                    </CardTitle>
                    <CardDescription>Logo et informations de l'institut</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Logo Upload */}
                    <div>
                        <Label htmlFor="logo">Logo de l'Institut</Label>
                        <div className="mt-2 flex items-center gap-4">
                            <div className="h-20 w-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                                <img src="/logo_asmil.jpg" alt="Logo" className="h-16 w-16 object-contain rounded" />
                            </div>
                            <div>
                                <Label htmlFor="logo-upload" className="cursor-pointer">
                                    <div className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
                                        <Upload className="h-4 w-4" />
                                        Changer le Logo
                                    </div>
                                </Label>
                                <Input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                />
                                <p className="text-xs text-slate-500 mt-1">PNG, JPG jusqu'à 2MB</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Institute Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name">Nom de l'Institut</Label>
                            <Input
                                id="name"
                                value={settings.instituteName}
                                onChange={(e) => setSettings({ ...settings, instituteName: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={settings.instituteEmail}
                                onChange={(e) => setSettings({ ...settings, instituteEmail: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone">Téléphone</Label>
                            <Input
                                id="phone"
                                value={settings.institutePhone}
                                onChange={(e) => setSettings({ ...settings, institutePhone: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="address">Adresse</Label>
                            <Input
                                id="address"
                                value={settings.instituteAddress}
                                onChange={(e) => setSettings({ ...settings, instituteAddress: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={() => handleSave('identity')}
                            disabled={isSaving && savedSection === 'identity'}
                            className="bg-blue-600 hover:bg-blue-700 gap-2"
                        >
                            {savedSection === 'identity' ? (
                                <>
                                    <Save className="h-4 w-4" />
                                    Enregistré!
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Enregistrer
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Numbering Section */}
            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-violet-600" />
                        Numérotation Automatique
                    </CardTitle>
                    <CardDescription>Configuration des numéros de factures et certificats</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Invoices */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-900">Factures</h3>
                            <div>
                                <Label htmlFor="invoice-prefix">Préfixe</Label>
                                <Input
                                    id="invoice-prefix"
                                    value={settings.invoicePrefix}
                                    onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                                    placeholder="INV"
                                />
                            </div>
                            <div>
                                <Label htmlFor="invoice-start">Numéro de départ</Label>
                                <Input
                                    id="invoice-start"
                                    type="number"
                                    value={settings.invoiceStartNumber}
                                    onChange={(e) => setSettings({ ...settings, invoiceStartNumber: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border">
                                <p className="text-sm text-slate-600">Exemple:</p>
                                <p className="font-mono font-semibold text-slate-900">{settings.invoicePrefix}-2025-{String(settings.invoiceStartNumber).padStart(3, '0')}</p>
                            </div>
                        </div>

                        {/* Certificates */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-900">Certificats</h3>
                            <div>
                                <Label htmlFor="cert-prefix">Préfixe</Label>
                                <Input
                                    id="cert-prefix"
                                    value={settings.certificatePrefix}
                                    onChange={(e) => setSettings({ ...settings, certificatePrefix: e.target.value })}
                                    placeholder="CERT"
                                />
                            </div>
                            <div>
                                <Label htmlFor="cert-start">Numéro de départ</Label>
                                <Input
                                    id="cert-start"
                                    type="number"
                                    value={settings.certificateStartNumber}
                                    onChange={(e) => setSettings({ ...settings, certificateStartNumber: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border">
                                <p className="text-sm text-slate-600">Exemple:</p>
                                <p className="font-mono font-semibold text-slate-900">{settings.certificatePrefix}-2025-{String(settings.certificateStartNumber).padStart(3, '0')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={() => handleSave('numbering')}
                            disabled={isSaving && savedSection === 'numbering'}
                            className="bg-violet-600 hover:bg-violet-700 gap-2"
                        >
                            {savedSection === 'numbering' ? (
                                <>
                                    <Save className="h-4 w-4" />
                                    Enregistré!
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Enregistrer
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications Section */}
            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-emerald-600" />
                        Notifications
                    </CardTitle>
                    <CardDescription>Configuration des notifications et rappels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="email-notif">Notifications Email</Label>
                                <p className="text-sm text-slate-500">Envoyer des emails automatiques</p>
                            </div>
                            <Switch
                                id="email-notif"
                                checked={settings.emailNotifications}
                                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                            />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="sms-notif">Notifications SMS</Label>
                                <p className="text-sm text-slate-500">Envoyer des SMS automatiques</p>
                            </div>
                            <Switch
                                id="sms-notif"
                                checked={settings.smsNotifications}
                                onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                            />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="payment-reminders">Rappels de Paiement</Label>
                                <p className="text-sm text-slate-500">Rappeler les paiements à venir</p>
                            </div>
                            <Switch
                                id="payment-reminders"
                                checked={settings.paymentReminders}
                                onCheckedChange={(checked) => setSettings({ ...settings, paymentReminders: checked })}
                            />
                        </div>

                        {settings.paymentReminders && (
                            <div className="ml-6">
                                <Label htmlFor="reminder-days">Jours avant échéance</Label>
                                <Input
                                    id="reminder-days"
                                    type="number"
                                    value={settings.reminderDaysBefore}
                                    onChange={(e) => setSettings({ ...settings, reminderDaysBefore: parseInt(e.target.value) })}
                                    className="w-32"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={() => handleSave('notifications')}
                            disabled={isSaving && savedSection === 'notifications'}
                            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                        >
                            {savedSection === 'notifications' ? (
                                <>
                                    <Save className="h-4 w-4" />
                                    Enregistré!
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Enregistrer
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* System Section */}
            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-600" />
                        Système
                    </CardTitle>
                    <CardDescription>Configuration système et maintenance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                            <div>
                                <Label htmlFor="maintenance">Mode Maintenance</Label>
                                <p className="text-sm text-red-600 font-medium">⚠️ Bloque l'accès aux non-administrateurs</p>
                            </div>
                            <Switch
                                id="maintenance"
                                checked={settings.maintenanceMode}
                                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                            />
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="timezone">Fuseau Horaire</Label>
                                <Input
                                    id="timezone"
                                    value={settings.timezone}
                                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="language">Langue</Label>
                                <Input
                                    id="language"
                                    value={settings.language}
                                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={() => handleSave('system')}
                            disabled={isSaving && savedSection === 'system'}
                            className="bg-red-600 hover:bg-red-700 gap-2"
                        >
                            {savedSection === 'system' ? (
                                <>
                                    <Save className="h-4 w-4" />
                                    Enregistré!
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Enregistrer
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
