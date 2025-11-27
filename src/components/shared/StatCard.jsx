import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

export default function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    trendLabel,
    color = 'emerald',
    subtitle,
    className = ''
}) {
    const colorClasses = {
        emerald: {
            gradient: 'from-emerald-500 to-emerald-600',
            bg: 'to-emerald-50',
            shadow: 'shadow-emerald-500/30',
            text: 'text-emerald-600',
            bgLight: 'bg-emerald-50',
            border: 'border-emerald-200',
        },
        blue: {
            gradient: 'from-blue-500 to-blue-600',
            bg: 'to-blue-50',
            shadow: 'shadow-blue-500/30',
            text: 'text-blue-600',
            bgLight: 'bg-blue-50',
            border: 'border-blue-200',
        },
        violet: {
            gradient: 'from-violet-500 to-violet-600',
            bg: 'to-violet-50',
            shadow: 'shadow-violet-500/30',
            text: 'text-violet-600',
            bgLight: 'bg-violet-50',
            border: 'border-violet-200',
        },
        amber: {
            gradient: 'from-amber-500 to-amber-600',
            bg: 'to-amber-50',
            shadow: 'shadow-amber-500/30',
            text: 'text-amber-600',
            bgLight: 'bg-amber-50',
            border: 'border-amber-200',
        },
        red: {
            gradient: 'from-red-500 to-red-600',
            bg: 'to-red-50',
            shadow: 'shadow-red-500/30',
            text: 'text-red-600',
            bgLight: 'bg-red-50',
            border: 'border-red-200',
        },
        slate: {
            gradient: 'from-slate-700 to-slate-800',
            bg: 'to-slate-50',
            shadow: 'shadow-slate-500/30',
            text: 'text-slate-600',
            bgLight: 'bg-slate-50',
            border: 'border-slate-200',
        },
    };

    const colors = colorClasses[color] || colorClasses.emerald;
    const isPositiveTrend = trend > 0;
    const TrendIcon = isPositiveTrend ? ArrowUpRight : ArrowDownRight;

    return (
        <Card className={`border-none shadow-lg bg-gradient-to-br from-white via-white ${colors.bg} hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden ${className}`}>
            {/* Background Icon */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <Icon className={`h-32 w-32 ${colors.text}`} />
            </div>

            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/0 to-${color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

            <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                    {/* Icon */}
                    <div className={`p-3 bg-gradient-to-br ${colors.gradient} rounded-2xl text-white shadow-lg ${colors.shadow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                        <Icon className="h-6 w-6 animate-pulse-slow" />
                    </div>

                    {/* Trend Badge */}
                    {trend !== undefined && (
                        <span className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm ${isPositiveTrend
                                ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                                : 'text-red-600 bg-red-50 border-red-200'
                            }`}>
                            <TrendIcon className="h-3.5 w-3.5 mr-1" />
                            {Math.abs(trend)}%
                        </span>
                    )}
                </div>

                <div>
                    <p className="text-slate-500 text-sm font-semibold mb-1">{title}</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-1">{value}</h3>
                    {subtitle && (
                        <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
                    )}
                    {trendLabel && (
                        <p className="text-xs text-slate-400 mt-1">{trendLabel}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
