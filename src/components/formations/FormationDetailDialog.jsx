
import React from "react";
import { useQuery } from "@tanstack/react-query";

import api from "@/services/api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  BookOpen,
  Clock,
  Layers,
  User,
  ChevronRight,
} from "lucide-react";

export default function FormationDetailDialog({
  formation,
  open,
  onClose,
  onEdit,
}) {
  /* ---------------------- LOAD MODULES ---------------------- */
  // Note: Idéalement on devrait charger les modules de CETTE formation via l'API
  // Mais pour l'instant on garde la logique de charger tout et filtrer (optimisation future possible)
  // Ou mieux, utiliser l'endpoint /formations/:id qui renvoie tout (modules, sessions)
  // Cependant, pour minimiser les changements structurels ici, je vais juste remplacer les appels.

  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      // Si pas d'endpoint global modules, on peut utiliser celui des formations et extraire
      // Mais supposons qu'on a besoin de tout pour l'instant ou que l'API a été adaptée.
      // En fait, formationController n'a pas de getAllModules public simple sans ID formation ?
      // Si, il n'y a pas de route /modules globale dans formationRoutes.js ?
      // Je vais vérifier formationRoutes.js. Si pas de route, je devrais utiliser formation.modules si dispo.
      // Le composant reçoit `formation` en prop. Si `formation` contient déjà `modules` et `sessions` (ce qui est le cas avec getFormationById ou getAllFormations du backend),
      // alors je n'ai PAS besoin de refaire des requêtes !
      return [];
    },
    enabled: false // On désactive car on va utiliser les props
  });

  /* ---------------------- LOAD SESSIONS ---------------------- */
  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => [],
    enabled: false
  });

  /* ---------------------- CATEGORY NAME ---------------------- */
  const categoryName = formation.category || "Sans catégorie";

  /* ---------------------- MODULES BY FORMATION ---------------------- */
  // On utilise les données incluses dans l'objet formation s'il vient du backend avec les includes
  // Sinon on fallback sur un tableau vide.
  // Le backend getAllFormations inclut: modules, sessions.
  const formationModules = formation.modules || [];

  const formationSessions = formation.sessions || [];

  const totalHours = formationModules.reduce(
    (sum, m) => sum + (m.hours || 0),
    0
  );

  const typeColors = {
    certifiante: "bg-blue-100 text-blue-800",
    diplomante: "bg-purple-100 text-purple-800",
    service: "bg-green-100 text-green-800",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">
            Détails de la Formation
          </DialogTitle>
        </DialogHeader>

        {/* ---------------------- Header Banner ---------------------- */}
        <div className="relative rounded-xl overflow-hidden mb-6">
          {formation.image_url ? (
            <img
              src={formation.image_url}
              alt={formation.title}
              className="w-full h-52 object-cover"
            />
          ) : (
            <div className="w-full h-52 bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
              <BookOpen className="h-20 w-20 text-white opacity-40" />
            </div>
          )}

          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Badge className={typeColors[formation.type] || "bg-slate-200"}>
              {formation.type}
            </Badge>
            <Badge variant="outline">{categoryName}</Badge>
          </div>

          <Button
            size="sm"
            className="absolute top-4 right-4 bg-white shadow-md text-slate-900 hover:bg-slate-100"
            onClick={onEdit}
          >
            Modifier
          </Button>
        </div>

        {/* ---------------------- Title & Description ---------------------- */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {formation.title}
          </h2>

          <p className="text-slate-600 mt-2 whitespace-pre-line">
            {formation.description || "Aucune description"}
          </p>

          {formation.prerequisites && (
            <div className="mt-3 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-semibold text-slate-700">Prérequis :</p>
              <p className="text-sm text-slate-600 whitespace-pre-line">
                {formation.prerequisites}
              </p>
            </div>
          )}
        </div>

        {/* ---------------------- Stats ---------------------- */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-slate-50 rounded-lg text-center">
            <p className="text-xs text-slate-500">Durée</p>
            <p className="text-xl font-bold text-slate-900">
              {formation.duration_months} mois
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg text-center">
            <p className="text-xs text-slate-500">Modules</p>
            <p className="text-xl font-bold text-slate-900">
              {formationModules.length}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg text-center">
            <p className="text-xs text-slate-500">Total heures</p>
            <p className="text-xl font-bold text-slate-900">
              {totalHours} h
            </p>
          </div>
        </div>

        {/* ---------------------- Modules ---------------------- */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Modules
          </h3>

          {formationModules.length === 0 ? (
            <p className="text-slate-500">Aucun module défini.</p>
          ) : (
            <div className="space-y-3">
              {formationModules.map((mod) => (
                <div
                  key={mod.id}
                  className="p-3 bg-slate-50 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{mod.title}</p>
                    <p className="text-sm text-slate-500">
                      {mod.hours} heures
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---------------------- Sessions ---------------------- */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <User className="h-5 w-5" />
            Sessions
          </h3>

          {formationSessions.length === 0 ? (
            <p className="text-slate-500">Aucune session planifiée.</p>
          ) : (
            <div className="space-y-3">
              {formationSessions.map((s) => (
                <div
                  key={s.id}
                  className="p-3 bg-slate-50 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{s.room}</p>
                    <p className="text-sm text-slate-500">
                      {s.start_date} → {s.end_date}
                    </p>
                  </div>

                  <Badge variant="outline">{s.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---------------------- PRICE ---------------------- */}
        <div className="mt-10 p-5 bg-red-50 rounded-xl">
          <p className="text-sm text-slate-500">Tarif</p>
          <p className="text-3xl font-black text-red-700">
            {formation.price?.toLocaleString()} Ar
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
