import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentAPI } from "@/api/localDB"; // ⬅️ LOCAL DB
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import StudentFormDialog from "../components/students/StudentFormDialog";
import StudentDetailDialog from "../components/students/StudentDetailDialog";
import { toast } from "sonner";

export default function Students() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);

  const queryClient = useQueryClient();

  // ✅ Load Students from localDB
  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: () => studentAPI.list(),
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (id) => studentAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Étudiant supprimé avec succès");
    },
  });

  const filteredStudents = students.filter((student) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch =
      student.first_name?.toLowerCase().includes(search) ||
      student.last_name?.toLowerCase().includes(search) ||
      student.registration_number?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "all" || student.status === statusFilter;

    return matchesSearch && matchesStatus;
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
    if (confirm("Supprimer cet étudiant ?")) {
      deleteStudentMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* ------ HEADER ------ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900">Étudiants</h1>
          <p className="text-slate-600 mt-1">Gérez tous vos étudiants</p>
        </div>
        <Button
          onClick={() => {
            setEditingStudent(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Étudiant
        </Button>
      </div>

      {/* ------ FILTERS ------ */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher un étudiant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          {["all", "actif", "inactif", "diplômé"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
              className={statusFilter === status ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {status === "all"
                ? "Tous"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* ------ TABLE ------ */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>N° Inscription</TableHead>
              <TableHead>Nom Complet</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Date d'inscription</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Aucun étudiant trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((s) => (
                <TableRow key={s.id} className="hover:bg-slate-50">
                  <TableCell>{s.registration_number}</TableCell>
                  <TableCell className="font-semibold">
                    {s.first_name} {s.last_name}
                  </TableCell>
                  <TableCell>{s.email || "-"}</TableCell>
                  <TableCell>{s.phone_parent || "-"}</TableCell>
                  <TableCell>
                    {s.enrollment_date
                      ? format(new Date(s.enrollment_date), "d MMM yyyy", {
                          locale: fr,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(s.status)} border`}
                    >
                      {s.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-slate-600">
        Total: {filteredStudents.length} étudiant(s)
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
