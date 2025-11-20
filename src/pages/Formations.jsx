import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  formationAPI,
  categoryAPI,
  moduleAPI,
  sessionAPI,
} from "@/api/localDB";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import {
  Plus,
  Search,
  BookOpen,
  Edit,
  Trash2,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";

import FormationFormDialog from "@/components/formations/FormationFormDialog";
import FormationDetailDialog from "@/components/formations/FormationDetailDialog";

export default function Formations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingFormation, setEditingFormation] = useState(null);
  const [viewingFormation, setViewingFormation] = useState(null);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const queryClient = useQueryClient();

  // -------------------------
  // LOAD DATA
  // -------------------------
  const { data: formations = [], isLoading } = useQuery({
    queryKey: ["formations"],
    queryFn: () => formationAPI.list(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryAPI.list(),
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: () => moduleAPI.list(),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => sessionAPI.list(),
  });

  // -------------------------
  // DELETE FORMATION
  // -------------------------
  const deleteFormationMutation = useMutation({
    mutationFn: (id) => formationAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formations"] });
      toast.success("Formation supprimée avec succès");
    },
  });

  // -------------------------
  // FILTERED LIST
  // -------------------------
  const filteredFormations = formations.filter((formation) => {
    const matchesSearch = formation.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesType =
      selectedType === "all" || formation.type === selectedType;

    const matchesCategory =
      selectedCategory === "all" || formation.category_id === selectedCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  const getFormationModules = (formationId) =>
    modules.filter((m) => m.formation_id === formationId);

  const getFormationSessions = (formationId) => {
    const modIds = modules
      .filter((m) => m.formation_id === formationId)
      .map((m) => m.id);
    return sessions.filter((s) => modIds.includes(s.module_id));
  };

  // -------------------------
  // STATS
  // -------------------------
  const stats = {
    total: formations.length,
    certifiantes: formations.filter((f) => f.type === "certifiante").length,
    diplomantes: formations.filter((f) => f.type === "diplomante").length,
    services: formations.filter((f) => f.type === "service").length,
  };

  const getTypeColor = (type) => {
    const colors = {
      certifiante: "bg-blue-100 text-blue-800 border-blue-200",
      diplomante: "bg-purple-100 text-purple-800 border-purple-200",
      service: "bg-green-100 text-green-800 border-green-200",
    };
    return colors[type] || "bg-slate-100 text-slate-800";
  };

  const getCategoryName = (categoryId) => {
    return categories.find((c) => c.id === categoryId)?.name || "Sans catégorie";
  };

  // ------------------------------------------------
  // RENDER PAGE
  // ------------------------------------------------
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900">Formations</h1>
          <p className="text-slate-600 mt-1">
            Gérez votre catalogue de formations
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingFormation(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Formation
        </Button>
      </div>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow bg-red-50 border-red-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Total</p>
              <h3 className="text-3xl font-bold text-red-900">{stats.total}</h3>
            </div>
            <BookOpen className="h-10 w-10 text-red-600" />
          </CardContent>
        </Card>

        <Card className="shadow bg-blue-50 border-blue-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Certifiantes</p>
              <h3 className="text-3xl font-bold text-blue-900">
                {stats.certifiantes}
              </h3>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-600" />
          </CardContent>
        </Card>

        <Card className="shadow bg-purple-50 border-purple-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700">Diplômantes</p>
              <h3 className="text-3xl font-bold text-purple-900">
                {stats.diplomantes}
              </h3>
            </div>
            <Users className="h-10 w-10 text-purple-600" />
          </CardContent>
        </Card>

        <Card className="shadow bg-green-50 border-green-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Services</p>
              <h3 className="text-3xl font-bold text-green-900">
                {stats.services}
              </h3>
            </div>
            <Clock className="h-10 w-10 text-green-600" />
          </CardContent>
        </Card>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher une formation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300"
          >
            <option value="all">Tous types</option>
            <option value="certifiante">Certifiante</option>
            <option value="diplomante">Diplômante</option>
            <option value="service">Service</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300"
          >
            <option value="all">Toutes catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LIST CONTENT */}
      {isLoading ? (
        <p className="text-center py-10 text-slate-500">Chargement...</p>
      ) : filteredFormations.length === 0 ? (
        <Card className="p-10 text-center">
          <BookOpen className="h-14 w-14 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold">Aucune formation trouvée</h3>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFormations.map((formation) => {
            const formationModules = getFormationModules(formation.id);
            const formationSessions = getFormationSessions(formation.id);
            const totalHours = formationModules.reduce(
              (s, m) => s + (m.hours || 0),
              0
            );

            return (
              <Card
                key={formation.id}
                className="hover:shadow-xl transition cursor-pointer"
                onClick={() => setViewingFormation(formation)}
              >
                {formation.image_url ? (
                  <img
                    src={formation.image_url}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="h-48 bg-red-600 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-white opacity-80" />
                  </div>
                )}

                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">
                      {formation.title}
                    </CardTitle>

                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
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
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Supprimer cette formation ?")) {
                            deleteFormationMutation.mutate(formation.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600">
                    {getCategoryName(formation.category_id)}
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-slate-50 rounded">
                      <p className="text-xs">Durée</p>
                      <p className="font-bold">
                        {formation.duration_months} mois
                      </p>
                    </div>

                    <div className="p-2 bg-slate-50 rounded">
                      <p className="text-xs">Modules</p>
                      <p className="font-bold">{formationModules.length}</p>
                    </div>

                    <div className="p-2 bg-slate-50 rounded">
                      <p className="text-xs">Sessions</p>
                      <p className="font-bold">{formationSessions.length}</p>
                    </div>
                  </div>

                  {totalHours > 0 && (
                    <p className="text-sm flex items-center gap-1 mt-3">
                      <Clock className="h-4 w-4" />
                      {totalHours}h au total
                    </p>
                  )}

                  <div className="border-t pt-3 mt-3">
                    <p className="text-sm">Tarif</p>
                    <p className="text-2xl font-bold text-red-700">
                      {formation.price?.toLocaleString()} Ar
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* DIALOGS */}
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

      {viewingFormation && (
        <FormationDetailDialog
          formation={viewingFormation}
          categories={categories}
          open={!!viewingFormation}
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
