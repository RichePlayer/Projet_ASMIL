import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  BookOpen,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Users,
  Clock
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import FormationFormDialog from "@/components/formations/FormationFormDialog";
import FormationDetailDialog from "@/components/formations/FormationDetailDialog";
import { useTranslation } from 'react-i18next';

import Swal from 'sweetalert2';

export default function Formations() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingFormation, setEditingFormation] = useState(null);
  const [viewingFormation, setViewingFormation] = useState(null);

  const queryClient = useQueryClient();

  /* ---------------------------------------------
    LOAD DATA FROM API
  ---------------------------------------------- */
  const { data: formations = [], isLoading } = useQuery({
    queryKey: ["formations"],
    queryFn: async () => {
      const response = await api.get('/formations?limit=1000');
      return response.data.formations || [];
    },
  });

  const categories = [
    "Informatique",
    "Langues",
    "Communication",
    "Développement Marketing",
    "Entrepreneuriat",
    "Leadership",
    "Management d'entreprise",
    "Management des projets",
    "Autre"
  ];

  // Note: Les modules sont souvent chargés avec les formations ou via un endpoint spécifique
  // Je vais supposer qu'il y a un endpoint pour lister tous les modules, ou je devrai adapter
  // Si le backend n'a pas /modules, je devrai peut-être le charger différemment.
  // Dans formationRoutes.js, il y a router.get('/:id/modules', ...).
  // Mais ici on veut tous les modules pour le filtrage.
  // Je vais vérifier si une route globale existe, sinon je devrai peut-être itérer (ce qui n'est pas idéal).
  // Pour l'instant, je vais commenter ou adapter.
  // Mieux: je vais vérifier si 'formations' inclut déjà les modules (include: { modules: true }).
  // Si oui, je peux extraire les modules des formations.

  // En regardant formationController.js (step 52), getAllFormations inclut les modules ?
  // "include: { category: true, modules: true, sessions: true }" -> OUI !
  // Donc je n'ai pas besoin de faire un appel séparé pour les modules si je les ai dans formations.
  // Cependant, le code existant utilise `modules` séparément.
  // Je vais adapter pour utiliser les modules inclus dans les formations.

  const modules = formations.flatMap(f => f.modules || []);

  // Idem pour les sessions, elles sont incluses dans la formation ?
  // "sessions: true" -> OUI.
  const sessions = formations.flatMap(f => f.sessions || []);


  /* ---------------------------------------------
    DELETE FORMATION
  ---------------------------------------------- */
  const deleteFormationMutation = useMutation({
    mutationFn: (id) => api.delete(`/formations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formations"] });
      Swal.fire(
        'Supprimée !',
        'La formation a été supprimée.',
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

  /* ---------------------------------------------
    HELPERS
  ---------------------------------------------- */

  const filteredFormations = formations.filter((f) => {
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || selectedType === f.type;
    const matchesCategory =
      selectedCategory === "all" || selectedCategory === f.category;

    return matchesSearch && matchesType && matchesCategory;
  });

  const getModulesByFormation = (formationId) =>
    modules.filter((m) => m.formation_id === formationId);

  const getSessionsByFormation = (formationId) => {
    const moduleIds = modules
      .filter((m) => m.formation_id === formationId)
      .map((m) => m.id);

    return sessions.filter((s) => moduleIds.includes(s.module_id));
  };

  // const getCategoryName = (categoryId) => ... // Plus besoin

  const getTypeColor = (type) => {
    const colors = {
      certifiante: "bg-blue-100 text-blue-800 border-blue-200",
      diplomante: "bg-purple-100 text-purple-800 border-purple-200",
      service: "bg-green-100 text-green-800 border-green-200",
    };
    return colors[type] || "bg-slate-100 text-slate-800";
  };

  /* ---------------------------------------------
    STATS
  ---------------------------------------------- */
  const stats = {
    total: formations.length,
    certifiantes: formations.filter((f) => f.type === "certifiante").length,
    diplomantes: formations.filter((f) => f.type === "diplomante").length,
    services: formations.filter((f) => f.type === "service").length,
  };

  /* ---------------------------------------------
    RENDER
  ---------------------------------------------- */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900">{t('formations.title')}</h1>
          <p className="text-slate-600">{t('formations.subtitle')}</p>
        </div>

        <Button
          onClick={() => {
            setEditingFormation(null);
            setShowForm(true);
          }}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('formations.addFormation')}
        </Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <p className="text-slate-500 text-sm font-semibold mb-1">{t('formations.stats.totalFormations')}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.total}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-blue-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <TrendingUp className="h-32 w-32 text-blue-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <TrendingUp className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">{t('formations.filters.certifying')}</span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">{t('formations.stats.certifying')}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.certifiantes}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-purple-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Users className="h-32 w-32 text-purple-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Users className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">{t('formations.filters.diploma')}</span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">{t('formations.stats.diploma')}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.diplomantes}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="stagger-item border-none shadow-lg bg-gradient-to-br from-white via-white to-emerald-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Clock className="h-32 w-32 text-emerald-600" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Clock className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">{t('formations.stats.services')}</span>
            </div>
            <div>
              <p className="text-slate-500 text-sm font-semibold mb-1">{t('formations.stats.services')}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.services}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
          <Input
            placeholder={t('formations.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="border p-2 rounded-lg"
        >
          <option value="all">{t('formations.filters.allTypes')}</option>
          <option value="certifiante">{t('formations.filters.certifying')}</option>
          <option value="diplomante">{t('formations.filters.diploma')}</option>
          <option value="service">{t('formations.filters.service')}</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border p-2 rounded-lg"
        >
          <option value="all">{t('formations.filters.allCategories')}</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* LIST */}
      {isLoading ? (
        <p className="text-center py-10 text-slate-500">Chargement…</p>
      ) : filteredFormations.length === 0 ? (
        <Card className="p-10 text-center shadow">
          <BookOpen className="h-14 w-14 mx-auto text-red-600 opacity-60" />
          <p className="text-slate-600 mt-2">{t('formations.card.noFormationFound')}</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFormations.map((formation) => {
            const formationModules = getModulesByFormation(formation.id);
            const formationSessions = getSessionsByFormation(formation.id);
            const totalHours = formationModules.reduce(
              (sum, mod) => sum + (mod.hours || 0),
              0
            );

            return (
              <Card
                key={formation.id}
                className="shadow-lg hover:-translate-y-1 transition cursor-pointer"
                onClick={() => setViewingFormation(formation)}
              >
                {formation.image_url ? (
                  <img
                    src={formation.image_url}
                    className="h-44 w-full object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="h-44 bg-red-600 flex items-center justify-center text-white">
                    <BookOpen className="h-14 w-14 opacity-70" />
                  </div>
                )}

                <CardHeader>
                  <div className="flex justify-between">
                    <Badge className={`${getTypeColor(formation.type)}`}>
                      {formation.type}
                    </Badge>

                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFormation(formation);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-600"
                        onClick={(e) => {
                          if (e) e.stopPropagation();
                          Swal.fire({
                            title: 'Êtes-vous sûr ?',
                            text: "Voulez-vous vraiment supprimer cette formation ?",
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#3085d6',
                            confirmButtonText: 'Oui, supprimer',
                            cancelButtonText: 'Annuler'
                          }).then((result) => {
                            if (result.isConfirmed) {
                              deleteFormationMutation.mutate(formation.id);
                            }
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <CardTitle className="line-clamp-2">
                    {formation.title}
                  </CardTitle>
                  <p className="text-sm text-slate-500">
                    {formation.category || t('formations.noCategory')}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {formation.description}
                  </p>

                  <div className="grid grid-cols-3 text-center text-sm">
                    <div>
                      <p className="text-slate-500">{t('formations.card.duration')}</p>
                      <p className="font-bold">{formation.duration_months} {t('formations.card.months')}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">{t('formations.modules')}</p>
                      <p className="font-bold">{formationModules.length}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">{t('formations.sessions')}</p>
                      <p className="font-bold">{formationSessions.length}</p>
                    </div>
                  </div>

                  {totalHours > 0 && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="h-4 w-4" />
                      {totalHours} h total
                    </div>
                  )}

                  <div className="pt-3 border-t space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{t('formations.card.registrationFee')}</span>
                      <span className="font-semibold text-slate-700">
                        {parseFloat(formation.registration_fee || 0).toLocaleString()} Ar
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">{t('formations.card.tuitionFee')}</span>
                      <span className="font-semibold text-slate-700">
                        {parseFloat(formation.tuition_fee || 0).toLocaleString()} Ar
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-dashed">
                      <span className="text-xs font-bold text-slate-400 uppercase">{t('formations.card.total')}</span>
                      <span className="font-bold text-red-600">
                        {(parseFloat(formation.tuition_fee || 0) + parseFloat(formation.registration_fee || 0)).toLocaleString()} Ar
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* FORM DIALOG */}
      {showForm && (
        <FormationFormDialog
          formation={editingFormation}
          categories={categories}
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingFormation(null);
          }}
        />
      )}

      {/* DETAIL DIALOG */}
      {viewingFormation && (
        <FormationDetailDialog
          formation={viewingFormation}
          categories={categories}
          open={true}
          onClose={() => setViewingFormation(null)}
          onEdit={() => {
            setEditingFormation(viewingFormation);
            setShowForm(true);
            setViewingFormation(null);
          }}
        />
      )}
    </div>
  );
}
