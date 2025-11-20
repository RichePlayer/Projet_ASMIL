import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, color = "red" }) {
  const colorClasses = {
    red: "from-red-500 to-red-600",
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  const isPositive = trend === "up";

  return (
    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-600 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900">{value}</h3>

            {trendValue && (
              <div className="flex items-center gap-1 mt-2">
                {isPositive ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                  {trendValue}
                </span>
                <span className="text-xs text-slate-500">ce mois</span>
              </div>
            )}
          </div>

          <div className={`p-4 rounded-2xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-md`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
