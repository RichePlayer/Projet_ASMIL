import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import invoiceService from "@/services/invoiceService";
import paymentService from "@/services/paymentService";
import enrollmentService from "@/services/enrollmentService";
import studentService from "@/services/studentService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
    Bell,
    AlertTriangle,
    CreditCard,
    UserPlus,
    Clock,
    TrendingUp,
    CheckCircle2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function NotificationDropdown() {
    const { data: invoicesData } = useQuery({
        queryKey: ["invoices"],
        queryFn: () => invoiceService.getAll(),
    });

    const { data: paymentsData } = useQuery({
        queryKey: ["payments"],
        queryFn: () => paymentService.getAll(),
    });

    const { data: enrollmentsData } = useQuery({
        queryKey: ["enrollments"],
        queryFn: () => enrollmentService.getAll(),
    });

    const { data: studentsData } = useQuery({
        queryKey: ["students"],
        queryFn: () => studentService.getAll(),
    });

    // Ensure all data is always an array
    const invoices = Array.isArray(invoicesData) ? invoicesData : [];
    const payments = Array.isArray(paymentsData) ? paymentsData : [];
    const enrollments = Array.isArray(enrollmentsData) ? enrollmentsData : [];
    const students = Array.isArray(studentsData) ? studentsData : [];

    // Calculate notifications
    const notifications = useMemo(() => {
        const alerts = [];

        // Overdue invoices
        const overdueInvoices = invoices.filter((inv) => {
            if (!inv.due_date) return false;
            const due = new Date(inv.due_date);
            const invPayments = payments.filter((p) => p.invoice_id === inv.id);
            const paidSum = invPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
            return paidSum < (Number(inv.amount) || 0) && due < new Date();
        });

        overdueInvoices.slice(0, 3).forEach((inv) => {
            const enrollment = enrollments.find((e) => e.id === inv.enrollment_id);
            const student = students.find((s) => s.id === enrollment?.student_id);
            const studentName = student
                ? `${student.first_name} ${student.last_name}`
                : "Étudiant";

            alerts.push({
                id: `overdue-${inv.id}`,
                type: "overdue",
                icon: AlertTriangle,
                iconColor: "text-red-600",
                bgColor: "bg-red-50",
                borderColor: "border-red-200",
                title: "Facture en retard",
                description: `${studentName} - ${inv.amount?.toLocaleString()} Ar`,
                time: inv.due_date ? format(new Date(inv.due_date), "d MMM", { locale: fr }) : "",
            });
        });

        // Unpaid invoices
        const unpaidInvoices = invoices.filter((inv) => {
            const invPayments = payments.filter((p) => p.invoice_id === inv.id);
            const paidSum = invPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
            return paidSum < (Number(inv.amount) || 0) && inv.status !== "annulée";
        });

        if (unpaidInvoices.length > overdueInvoices.length) {
            const remaining = unpaidInvoices.length - overdueInvoices.length;
            alerts.push({
                id: "unpaid-summary",
                type: "unpaid",
                icon: CreditCard,
                iconColor: "text-amber-600",
                bgColor: "bg-amber-50",
                borderColor: "border-amber-200",
                title: "Paiements en attente",
                description: `${remaining} facture(s) impayée(s)`,
                time: "À traiter",
            });
        }

        // Recent enrollments (last 7 days)
        const recentEnrollments = enrollments.filter((e) => {
            if (!e.created_date && !e.createdAt) return false;
            const created = new Date(e.created_date || e.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return created >= weekAgo;
        });

        if (recentEnrollments.length > 0) {
            alerts.push({
                id: "enrollments-recent",
                type: "enrollment",
                icon: UserPlus,
                iconColor: "text-blue-600",
                bgColor: "bg-blue-50",
                borderColor: "border-blue-200",
                title: "Nouvelles inscriptions",
                description: `${recentEnrollments.length} inscription(s) cette semaine`,
                time: "Cette semaine",
            });
        }

        // Today's sessions
        const sessionsToday = enrollments.filter((e) => {
            if (!e.start_date && !e.session_start) return false;
            const start = e.start_date ? new Date(e.start_date) : null;
            const end = e.end_date ? new Date(e.end_date) : null;
            const today = new Date();
            if (start && end) return today >= start && today <= end;
            return false;
        }).length;

        if (sessionsToday > 0) {
            alerts.push({
                id: "sessions-today",
                type: "session",
                icon: Clock,
                iconColor: "text-violet-600",
                bgColor: "bg-violet-50",
                borderColor: "border-violet-200",
                title: "Sessions du jour",
                description: `${sessionsToday} session(s) active(s)`,
                time: "Aujourd'hui",
            });
        }

        // Recent payments (last 3)
        const recentPayments = payments
            .sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""))
            .slice(0, 2);

        recentPayments.forEach((payment) => {
            alerts.push({
                id: `payment-${payment.id}`,
                type: "payment",
                icon: CheckCircle2,
                iconColor: "text-emerald-600",
                bgColor: "bg-emerald-50",
                borderColor: "border-emerald-200",
                title: "Paiement reçu",
                description: `${payment.amount?.toLocaleString()} Ar - ${payment.method}`,
                time: payment.created_date
                    ? format(new Date(payment.created_date), "d MMM HH:mm", { locale: fr })
                    : "",
            });
        });

        return alerts;
    }, [invoices, payments, enrollments, students]);

    const unreadCount = notifications.filter((n) => n.type === "overdue" || n.type === "unpaid").length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all duration-300"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <>
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
                            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-96 p-0 rounded-2xl shadow-2xl border-slate-200 bg-white animate-in slide-in-from-top-2 duration-300"
            >
                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">Notifications</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {notifications.length} notification(s)
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <Badge variant="destructive" className="rounded-full px-2.5 py-0.5 text-xs font-bold">
                                {unreadCount} nouveau(x)
                            </Badge>
                        )}
                    </div>
                </div>

                <ScrollArea className="max-h-[480px]">
                    <div className="p-2">
                        {notifications.length === 0 ? (
                            <div className="py-12 text-center">
                                <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm text-slate-500 font-medium">Aucune notification</p>
                                <p className="text-xs text-slate-400 mt-1">Vous êtes à jour !</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {notifications.map((notification) => {
                                    const Icon = notification.icon;
                                    return (
                                        <div
                                            key={notification.id}
                                            className={`group p-3 rounded-xl border ${notification.borderColor} ${notification.bgColor} hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-[1.02]`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={`p-2 rounded-lg bg-white shadow-sm ${notification.iconColor} group-hover:scale-110 transition-transform duration-300`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-sm font-bold text-slate-900 leading-tight">
                                                            {notification.title}
                                                        </p>
                                                        <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                                                            {notification.time}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                                        {notification.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
