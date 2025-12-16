import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import attendanceService from "@/services/attendanceService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Clock, Search, Users, AlertCircle, Save, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import DataTable from "@/components/ui/data-table";

export default function AttendanceSheet({ sessionId, date, enrollments, students, attendances }) {
  const [attendanceData, setAttendanceData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    const data = {};
    enrollments.forEach((enrollment) => {
      const existing = attendances.find(
        (a) => a.enrollment_id === enrollment.id &&
          (typeof a.date === 'string' ? a.date.split('T')[0] : new Date(a.date).toISOString().split('T')[0]) === date
      );
      data[enrollment.id] = existing?.status || "présent";
    });
    setAttendanceData(data);
  }, [enrollments, attendances, date]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const attendanceRecords = Object.entries(data).map(([enrollmentId, status]) => ({
        enrollment_id: parseInt(enrollmentId),
        status,
        notes: ""
      }));
      return attendanceService.bulkCreate(sessionId, date, attendanceRecords);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
      Swal.fire({
        icon: "success",
        title: "Enregistré !",
        text: "Les présences ont été enregistrées avec succès.",
        timer: 2000,
        showConfirmButton: false
      });
    },
    onError: (error) => {
      console.error("Erreur lors de l'enregistrement:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Une erreur est survenue lors de l'enregistrement des présences."
      });
    }
  });

  const handleSave = () => {
    Swal.fire({
      title: "Confirmer l'enregistrement ?",
      text: `Voulez-vous enregistrer les présences pour ${Object.keys(attendanceData).length} étudiant(s) ?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Oui, enregistrer",
      cancelButtonText: "Annuler"
    }).then((result) => {
      if (result.isConfirmed) {
        saveMutation.mutate(attendanceData);
      }
    });
  };

  const setStatus = (enrollmentId, status) => {
    setAttendanceData({ ...attendanceData, [enrollmentId]: status });
  };

  const getStatusBadge = (status) => {
    const styles = {
      présent: "bg-green-100 text-green-800 border-green-200",
      absent: "bg-red-100 text-red-800 border-red-200",
      retard: "bg-orange-100 text-orange-800 border-orange-200",
      excusé: "bg-blue-100 text-blue-800 border-blue-200"
    };
    return styles[status] || "bg-slate-100 text-slate-800 border-slate-200";
  };

  const setAllStatus = (status) => {
    const statusLabels = { présent: "présents", absent: "absents", retard: "en retard", excusé: "excusés" };
    Swal.fire({
      title: `Marquer tous ${statusLabels[status]} ?`,
      text: `Tous les étudiants filtrés seront marqués comme "${status}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Oui, appliquer",
      cancelButtonText: "Annuler"
    }).then((result) => {
      if (result.isConfirmed) {
        const newData = {};
        filteredEnrollments.forEach((enrollment) => {
          newData[enrollment.id] = status;
        });
        setAttendanceData({ ...attendanceData, ...newData });
        Swal.fire({
          icon: "success",
          title: "Appliqué !",
          text: `Tous les étudiants ont été marqués comme "${status}".`,
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const getStudentName = (enrollment) => {
    const student = enrollment.student || students.find((s) => s.id === enrollment.student_id);
    return student ? `${student.first_name} ${student.last_name}` : "Étudiant inconnu";
  };

  const getStudentMatricule = (enrollment) => {
    const student = enrollment.student || students.find((s) => s.id === enrollment.student_id);
    return student?.registration_number || "-";
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const studentName = getStudentName(enrollment).toLowerCase();
    const matricule = getStudentMatricule(enrollment).toLowerCase();
    return studentName.includes(searchQuery.toLowerCase()) || matricule.includes(searchQuery.toLowerCase());
  });

  const stats = {
    present: Object.values(attendanceData).filter((s) => s === "présent").length,
    absent: Object.values(attendanceData).filter((s) => s === "absent").length,
    late: Object.values(attendanceData).filter((s) => s === "retard").length,
    excused: Object.values(attendanceData).filter((s) => s === "excusé").length,
  };

  // Préparer les données pour DataTable
  const tableData = filteredEnrollments.map((enrollment, index) => ({
    ...enrollment,
    _index: index + 1,
    _name: getStudentName(enrollment),
    _matricule: getStudentMatricule(enrollment),
    _status: attendanceData[enrollment.id] || "présent"
  }));

  const columns = [
    {
      key: "_index",
      label: "#",
      sortable: false,
      searchable: false,
      render: (row) => (
        <span className="font-mono text-slate-500">{row._index}</span>
      )
    },
    {
      key: "_matricule",
      label: "Matricule",
      sortable: true,
      render: (row) => (
        <span className="text-sm font-medium text-slate-600">{row._matricule}</span>
      )
    },
    {
      key: "_name",
      label: "Étudiant",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${row._status === "présent" ? "bg-green-500" :
              row._status === "absent" ? "bg-red-500" :
                row._status === "excusé" ? "bg-blue-500" :
                  "bg-orange-500"
            }`}></div>
          <span className="font-semibold text-slate-900">{row._name}</span>
        </div>
      )
    },
    {
      key: "_status",
      label: "Statut",
      sortable: true,
      render: (row) => (
        <Badge variant="outline" className={`${getStatusBadge(row._status)} font-semibold`}>
          {row._status.charAt(0).toUpperCase() + row._status.slice(1)}
        </Badge>
      )
    },
    {
      key: "actions",
      label: "Actions Rapides",
      sortable: false,
      searchable: false,
      render: (row) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={row._status === "présent" ? "default" : "ghost"}
            onClick={() => setStatus(row.id, "présent")}
            className={`h-8 w-8 p-0 ${row._status === "présent" ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50"}`}
            title="Présent"
          >
            <CheckCircle2 className={`h-4 w-4 ${row._status === "présent" ? "text-white" : "text-green-600"}`} />
          </Button>
          <Button
            size="sm"
            variant={row._status === "absent" ? "default" : "ghost"}
            onClick={() => setStatus(row.id, "absent")}
            className={`h-8 w-8 p-0 ${row._status === "absent" ? "bg-red-600 hover:bg-red-700" : "hover:bg-red-50"}`}
            title="Absent"
          >
            <XCircle className={`h-4 w-4 ${row._status === "absent" ? "text-white" : "text-red-600"}`} />
          </Button>
          <Button
            size="sm"
            variant={row._status === "retard" ? "default" : "ghost"}
            onClick={() => setStatus(row.id, "retard")}
            className={`h-8 w-8 p-0 ${row._status === "retard" ? "bg-orange-600 hover:bg-orange-700" : "hover:bg-orange-50"}`}
            title="Retard"
          >
            <Clock className={`h-4 w-4 ${row._status === "retard" ? "text-white" : "text-orange-600"}`} />
          </Button>
          <Button
            size="sm"
            variant={row._status === "excusé" ? "default" : "ghost"}
            onClick={() => setStatus(row.id, "excusé")}
            className={`h-8 w-8 p-0 ${row._status === "excusé" ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-50"}`}
            title="Excusé"
          >
            <AlertCircle className={`h-4 w-4 ${row._status === "excusé" ? "text-white" : "text-blue-600"}`} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAllStatus("présent")}
            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Tout Présent
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAllStatus("absent")}
            className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Tout Absent
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAllStatus("retard")}
            className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
          >
            <Clock className="h-4 w-4 mr-1" />
            Tout Retard
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAllStatus("excusé")}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            Tout Excusé
          </Button>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-5 gap-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
        <div className="text-center">
          <p className="text-xs text-slate-600 font-medium">Total</p>
          <p className="text-2xl font-bold text-slate-900">{filteredEnrollments.length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-green-600 font-medium">Présents</p>
          <p className="text-2xl font-bold text-green-700">{stats.present}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-red-600 font-medium">Absents</p>
          <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-orange-600 font-medium">Retards</p>
          <p className="text-2xl font-bold text-orange-700">{stats.late}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-blue-600 font-medium">Excusés</p>
          <p className="text-2xl font-bold text-blue-700">{stats.excused}</p>
        </div>
      </div>

      {/* DataTable */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {enrollments.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">Aucun étudiant inscrit à cette session</p>
          </div>
        ) : (
          <DataTable
            data={tableData}
            columns={columns}
            searchable={true}
            defaultPageSize={10}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        )}
      </div>

      {/* Save Button */}
      {enrollments.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            {filteredEnrollments.length} étudiant(s) •
            {stats.present} présent(s) •
            {stats.absent} absent(s) •
            {stats.late} retard(s) •
            {stats.excused} excusé(s)
          </div>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
            disabled={saveMutation.isPending}
            size="lg"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer les Présences
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
