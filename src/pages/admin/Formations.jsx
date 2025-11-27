
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

import { toast } from "sonner";

export default function Formations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingFormation, setEditingFormation] = useState(null);
  const [viewingFormation, setViewingFormation] = useState(null);

  const queryClient = useQueryClient();

  /* ---------------------------------------------
    LOAD DATA FROM LOCALDB
  ---------------------------------------------- */
  const { data: formations = [], isLoading } = useQuery({
    queryKey: ["formations"],
    queryFn: () => formationAPI.list("-created_date", 500),
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

  /* ---------------------------------------------
    DELETE FORMATION
  ---------------------------------------------- */
  const deleteFormationMutation = useMutation({
    mutationFn: (id) => formationAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formations"] });
      toast.success("Formation supprimée");
    },
  });

  /* ---------------------------------------------
    HELPERS
  ---------------------------------------------- */

  const filteredFormations = formations.filter((f) => {
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || selectedType === f.type;
    const matchesCategory =
      selectedCategory === "all" || selectedCategory === f.category_id;

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

  const getCategoryName = (categoryId) =>
    categories.find((c) => c.id === categoryId)?.name || "Sans catégorie";

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
          <h1 className="text-4xl font-black text-slate-900">Formations</h1>
          <p className="text-slate-600">Gérez votre catalogue</p>
        </div>

        <Button
          onClick={() => {
            setEditingFormation(null);
            setShowForm(true);
          }}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Formation
        </Button>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-red-50 border-0 shadow">
          <CardContent className="p-5 flex justify-between">
            <div>
              <p className="text-sm text-red-700">Total</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <BookOpen className="h-10 w-10 text-red-600" />
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-0 shadow">
          <CardContent className="p-5 flex justify-between">
            <div>
              <p className="text-sm text-blue-700">Certifiantes</p>
              <p className="text-3xl font-bold">{stats.certifiantes}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-600" />
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-0 shadow">
          <CardContent className="p-5 flex justify-between">
            <div>
              <p className="text-sm text-purple-700">Diplômantes</p>
              <p className="text-3xl font-bold">{stats.diplomantes}</p>
            </div>
            <Users className="h-10 w-10 text-purple-600" />
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-0 shadow">
          <CardContent className="p-5 flex justify-between">
            <div>
              <p className="text-sm text-green-700">Services</p>
              <p className="text-3xl font-bold">{stats.services}</p>
            </div>
            <Clock className="h-10 w-10 text-green-600" />
          </CardContent>
        </Card>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Rechercher une formation..."
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
          <option value="all">Tous types</option>
          <option value="certifiante">Certifiante</option>
          <option value="diplomante">Diplômante</option>
          <option value="service">Service</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border p-2 rounded-lg"
        >
          <option value="all">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
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
          <p className="text-slate-600 mt-2">Aucune formation trouvée</p>
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
                          e.stopPropagation();
                          if (confirm("Supprimer cette formation ?")) {
                            deleteFormationMutation.mutate(formation.id);
                          }
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
                    {getCategoryName(formation.category_id)}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {formation.description}
                  </p>

                  <div className="grid grid-cols-3 text-center text-sm">
                    <div>
                      <p className="text-slate-500">Durée</p>
                      <p className="font-bold">{formation.duration_months} mois</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Modules</p>
                      <p className="font-bold">{formationModules.length}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Sessions</p>
                      <p className="font-bold">{formationSessions.length}</p>
                    </div>
                  </div>

                  {totalHours > 0 && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="h-4 w-4" />
                      {totalHours} h total
                    </div>
                  )}

                  <div className="pt-3 border-t flex justify-between">
                    <span className="text-sm text-slate-500">Tarif</span>
                    <span className="text-xl font-bold text-red-600">
                      {formation.price.toLocaleString()} Ar
                    </span>
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
