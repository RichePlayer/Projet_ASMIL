import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Lock, Bell, Shield, Mail, Phone, MapPin, Building } from "lucide-react";

export default function Profile() {
    return (
        <div className="space-y-8">
            {/* Header Profile */}
            <div className="relative h-48 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 overflow-hidden shadow-md">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] opacity-20 bg-cover bg-center"></div>
                <div className="absolute bottom-0 left-0 p-8 flex items-end gap-6">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-red-600 text-white text-3xl font-bold">S</AvatarFallback>
                    </Avatar>
                    <div className="mb-2 text-white">
                        <h1 className="text-3xl font-bold">Secrétaire Principale</h1>
                        <p className="text-slate-300 font-medium">Gestionnaire Administratif • Institut ASMiL</p>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px] bg-white border border-slate-200">
                    <TabsTrigger value="general">Général</TabsTrigger>
                    <TabsTrigger value="security">Sécurité</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-sm bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg">Contact</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-700">secretaire@asmil.mg</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-700">+261 34 00 000 00</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-700">Antananarivo, Madagascar</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Building className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-700">Bureau A-102</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <TabsContent value="general" className="mt-0">
                            <Card className="border-none shadow-sm bg-white">
                                <CardHeader>
                                    <CardTitle>Informations Personnelles</CardTitle>
                                    <CardDescription>
                                        Mettez à jour vos informations personnelles et professionnelles.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstname">Prénom</Label>
                                            <Input id="firstname" defaultValue="Secrétaire" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastname">Nom</Label>
                                            <Input id="lastname" defaultValue="Principale" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Input id="bio" defaultValue="Responsable de la gestion administrative et des inscriptions." />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="bg-red-600 hover:bg-red-700 text-white">Sauvegarder les modifications</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security" className="mt-0">
                            <Card className="border-none shadow-sm bg-white">
                                <CardHeader>
                                    <CardTitle>Sécurité du Compte</CardTitle>
                                    <CardDescription>
                                        Gérez votre mot de passe et les paramètres de sécurité.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current">Mot de passe actuel</Label>
                                        <Input id="current" type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new">Nouveau mot de passe</Label>
                                        <Input id="new" type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                                        <Input id="confirm" type="password" />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="bg-red-600 hover:bg-red-700 text-white">Mettre à jour le mot de passe</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="notifications" className="mt-0">
                            <Card className="border-none shadow-sm bg-white">
                                <CardHeader>
                                    <CardTitle>Préférences de Notification</CardTitle>
                                    <CardDescription>
                                        Choisissez comment vous souhaitez être notifié.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Mock toggles */}
                                    <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Notifications par email</Label>
                                            <p className="text-xs text-slate-500">Recevoir un résumé quotidien.</p>
                                        </div>
                                        <div className="h-6 w-11 bg-red-600 rounded-full relative cursor-pointer">
                                            <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Alertes système</Label>
                                            <p className="text-xs text-slate-500">Notifications importantes sur le dashboard.</p>
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
