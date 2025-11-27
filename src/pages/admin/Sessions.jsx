import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionAPI } from "@/api/localDB";
import { moduleAPI } from "@/api/localDB";
import { formationAPI } from "@/api/localDB";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SessionFormDialog from "@/components/sessions/SessionFormDialog";
import SessionCard from "@/components/sessions/SessionCard";
import SessionCalendarAdvanced from "@/components/sessions/SessionCalendarAdvanced";

export default function Sessions() {
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [statusFilter, setStatusFilter] = useState("all");

  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => sessionAPI.list("-start_date", 200),
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: () => moduleAPI.list(),
  });

  const { data: formations = [] } = useQuery({
    queryKey: ["formations"],
    queryFn: () => formationAPI.list(),
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (id) => sessionAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const filteredSessions = sessions.filter((session) => {
    if (statusFilter === "all") return true;
    return session.status === statusFilter;
  });

  const getModuleName = (moduleId) => {
    const module = modules.find((m) => m.id === moduleId);
    return module?.title || "Module inconnu";
  };

  const getFormationName = (moduleId) => {
    const module = modules.find((m) => m.id === moduleId);
    if (!module) return "";
    const formation = formations.find((f) => f.id === module.formation_id);
    return formation?.title || "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900">Sessions</h1>
          <p className="text-slate-600 mt-1">Planifiez et gérez vos sessions de formation</p>
        </div>
        <Button
          onClick={() => {
            setEditingSession(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Session
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {["all", "à venir", "en cours", "terminée"].map((status) => {
          const count = status === "all" ? sessions.length : sessions.filter((s) => s.status === status).length;
          const colors = {
            all: "bg-slate-50 border-slate-200 text-slate-900",
            "à venir": "bg-blue-50 border-blue-200 text-blue-900",
            "en cours": "bg-green-50 border-green-200 text-green-900",
            terminée: "bg-slate-50 border-slate-300 text-slate-700",
          };
          return (
            <Card
              key={status}
              className={`cursor-pointer transition-all hover:shadow-lg ${colors[status]} ${statusFilter === status ? "ring-2 ring-red-500" : ""
                }`}
              onClick={() => setStatusFilter(status)}
            >
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold">{count}</p>
                <p className="text-sm mt-1">{status === "all" ? "Toutes" : status.charAt(0).toUpperCase() + status.slice(1)}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* View Toggle */}
      <Tabs value={viewMode} onValueChange={setViewMode}>
        <TabsList>
          <TabsTrigger value="grid">Grille</TabsTrigger>
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-6">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500">Chargement...</div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <p>Aucune session trouvée</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  moduleName={getModuleName(session.module_id)}
                  formationName={getFormationName(session.module_id)}
                  onEdit={() => {
                    setEditingSession(session);
                    setShowForm(true);
                  }}
                  onDelete={() => {
                    if (confirm("Supprimer cette session ?")) {
                      deleteSessionMutation.mutate(session.id);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <SessionCalendarAdvanced />
        </TabsContent>
      </Tabs>

      {/* Session Form Dialog */}
      {showForm && (
        <SessionFormDialog
          session={editingSession}
          modules={modules}
          formations={formations}
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingSession(null);
          }}
        />
      )}
    </div>
  );
}
