import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function RecentActivityCard({ activities = [], title, icon: Icon }) {
  const statusClasses = {
    actif: "bg-green-100 text-green-800",
    "en attente": "bg-yellow-100 text-yellow-800",
    terminé: "bg-blue-100 text-blue-800",
    annulé: "bg-red-100 text-red-800",
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-red-600" />}
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {activities.length === 0 && (
          <p className="text-center py-8 text-slate-500">Aucune activité récente</p>
        )}

        <div className="divide-y">
          {activities.slice(0, 5).map((act, idx) => (
            <div key={idx} className="p-4 hover:bg-slate-50">
              <div className="flex items-center justify-between">
                <p className="font-medium">{act.title}</p>
                <Badge className={statusClasses[act.status] || "bg-slate-200"}>
                  {act.status}
                </Badge>
              </div>

              <p className="text-xs text-slate-500 mt-1">
                {format(new Date(act.created_date), "d MMM yyyy", { locale: fr })}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
