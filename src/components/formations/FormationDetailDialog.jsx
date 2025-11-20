import React from "react";
import { useQuery } from "@tanstack/react-query";
import { localDB } from "@/api/localDB";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, DollarSign, Edit, List } from "lucide-react";

export default function FormationDetailDialog({
  formation,
  open,
  onClose,
  onEdit,
}) {
  const { data: modules = [] } = useQuery({
    queryKey: ["formation-modules", formation?.id],
    queryFn: () => localDB.module.filter({ formation_id: formation.id }),
    enabled: !!formation?.id,
  });

  if (!formation) return null;

  const getTypeColor = (type) => {
    const colors = {
      certifiante: "bg-blue-100 text-blue-800 border-blue-200",
      diplomante: "bg-purple-100 text-purple-800 border-purple-200",
      service: "bg-green-100 text-green-800 border-green-200",
    };
    return colors[type] || "bg-slate-100 text-slate-800";
  };

  const totalHours = modules.reduce(
    (sum, mod) => sum + (mod.hours || 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Détails de la Formation
            </DialogTitle>
            <Button onClick={onEdit} className="bg-red-600 hover:bg-red-700">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          {formation.image_url && (
            <img
              src={formation.image_url}
              alt={formation.title}
              className="w-full h-64 object-cover rounded-xl"
            />
          )}

          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="outline"
                className={`${getTypeColor(formation.type)} border`}
              >
                {formation.type}
              </Badge>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {formation.title}
            </h2>
            <p className="text-slate-600">{formation.description}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-800">
                  {formation.price?.toLocaleString()} DH
                </p>
                <p className="text-sm text-red-700">Prix</p>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-800">
                  {formation.duration_months} mois
                </p>
                <p className="text-sm text-blue-700">Durée</p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <List className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-800">
                  {modules.length}
                </p>
                <p className="text-sm text-green-700">Modules</p>
              </CardContent>
            </Card>
          </div>

          {/* Prérequis */}
          {formation.prerequisites && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Prérequis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  {formation.prerequisites}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Modules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-red-600" />
                Modules ({modules.length}) - {totalHours}h au total
              </CardTitle>
            </CardHeader>
            <CardContent>
              {modules.length === 0 ? (
                <p className="text-center text-slate-500 py-8">
                  Aucun module ajouté
                </p>
              ) : (
                <div className="space-y-3">
                  {modules.map((module, index) => (
                    <div
                      key={module.id}
                      className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                              {index + 1}
                            </span>
                            <h4 className="font-semibold text-slate-900">
                              {module.title}
                            </h4>
                          </div>
                          <p className="text-sm text-slate-600 ml-8">
                            {module.description || "Aucune description"}
                          </p>
                        </div>

                        <Badge variant="outline" className="ml-4">
                          {module.hours}h
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
