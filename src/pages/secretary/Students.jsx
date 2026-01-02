import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import studentService from "@/services/studentService";
import { Button } from "@/components/ui/button";
import {
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DataTable from "@/components/ui/data-table";
import StudentFormDialog from "@/components/students/StudentFormDialog";
import StudentDetailDialog from "@/components/students/StudentDetailDialog";
import Swal from 'sweetalert2';

export default function Students() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);

  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // ✅ Load Students from backend API
  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: () => studentService.getAll(),
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (id) => studentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      Swal.fire({
        icon: 'success',
        title: 'Supprimé !',
        text: 'L\'étudiant a été supprimé avec succès.',
        timer: 2000,
        showConfirmButton: false
      });
    },
    onError: (error) => {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur est survenue lors de la suppression.',
      });
    }
  });

  const filteredStudents = students.filter((student) => {
    const matchesStatus =
      statusFilter === "all" || student.status === statusFilter;
    return matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      actif: "bg-green-100 text-green-800 border-green-200",
      inactif: "bg-slate-100 text-slate-800 border-slate-200",
      diplômé: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return colors[status] || "";
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleView = (student) => {
    setViewingStudent(student);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Voulez-vous vraiment supprimer cet étudiant ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteStudentMutation.mutate(id);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* ------ HEADER ------ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900">{t('students.title')}</h1>
          <p className="text-slate-600 mt-1">{t('students.subtitle')}</p>
        </div>
        <Button
          onClick={() => {
            setEditingStudent(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('students.addStudent')}
        </Button>
      </div>

      {/* ------ FILTERS ------ */}
      <div className="flex flex-wrap gap-2">
        {["all", "actif", "inactif", "diplômé"].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            onClick={() => setStatusFilter(status)}
            className={statusFilter === status ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {status === "all"
              ? t('students.filters.all')
              : status === "actif" ? t('students.filters.active')
                : status === "inactif" ? t('students.filters.inactive')
                  : t('students.filters.graduated')}
          </Button>
        ))}
      </div>

      {/* ------ TABLE ------ */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        ) : (
          <DataTable
            data={filteredStudents}
            columns={[
              {
                key: 'registration_number',
                label: t('students.registrationNumber'),
                sortable: true,
              },
              {
                key: 'name',
                label: t('students.fullName'),
                sortable: true,
                render: (s) => `${s.first_name} ${s.last_name}`,
              },
              {
                key: 'email',
                label: t('students.email'),
                sortable: true,
                render: (s) => s.email || "-",
              },
              {
                key: 'phone_parent',
                label: t('students.phone'),
                sortable: true,
                render: (s) => s.phone_parent || "-",
              },
              {
                key: 'status',
                label: t('students.status'),
                sortable: true,
                render: (s) => (
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(s.status)} border`}
                  >
                    {s.status}
                  </Badge>
                ),
              },
              {
                key: 'actions',
                label: t('common.actions'),
                sortable: false,
                searchable: false,
                render: (s) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(s)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(s)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(s.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ),
              },
            ]}
            searchable={true}
            defaultPageSize={10}
            pageSizeOptions={[10, 25, 50, 100]}
          />
        )}
      </div>

      {/* ------ DIALOGS ------ */}
      {showForm && (
        <StudentFormDialog
          student={editingStudent}
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingStudent(null);
          }}
        />
      )}

      {viewingStudent && (
        <StudentDetailDialog
          student={viewingStudent}
          open={!!viewingStudent}
          onClose={() => setViewingStudent(null)}
          onEdit={() => {
            handleEdit(viewingStudent);
            setViewingStudent(null);
          }}
        />
      )}
    </div>
  );
}
