// src/pages/Certificates.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  certificateAPI,
  studentAPI,
  enrollmentAPI,
  gradeAPI,
  attendanceAPI,
} from "@/api/localDB";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  Play,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import CertificateGenerator from "@/components/certificates/CertificateGenerator";
import CertificatePreview from "@/components/certificates/CertificatePreview";

export default function Certificates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);

  const queryClient = useQueryClient();

  const { data: certificates = [] } = useQuery({
    queryKey: ["certificates"],
    queryFn: () => certificateAPI.list("-created_date", 200),
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: () => studentAPI.list(),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => enrollmentAPI.list(),
  });

  const { data: grades = [] } = useQuery({
    queryKey: ["grades"],
    queryFn: () => gradeAPI.list(),
  });

  const { data: attendances = [] } = useQuery({
    queryKey: ["attendances"],
    queryFn: () => attendanceAPI.list(),
  });

  const generateCertificatesMutation = useMutation({
    mutationFn: async () => {
      const eligible = enrollments.filter((e) => e.status === "terminé");
      const created = [];

      for (const enrollment of eligible) {
        const existing = certificates.find((c) => c.enrollment_id === enrollment.id);
        if (existing) continue;

        const enrollmentGrades = grades.filter((g) => g.enrollment_id === enrollment.id);
        const enrollmentAttendances = attendances.filter((a) => a.enrollment_id === enrollment.id);

        if (enrollmentGrades.length === 0) continue;

        const avgGrade =
          enrollmentGrades.reduce((sum, g) => sum + ((g.value / g.max_value) * 20 || 0), 0) /
          enrollmentGrades.length;
        const attendanceRate =
          enrollmentAttendances.length > 0
            ? (enrollmentAttendances.filter((a) => a.status === "présent").length / enrollmentAttendances.length) * 100
            : 0;

        if (avgGrade >= 10 && attendanceRate >= 75) {
          const student = students.find((s) => s.id === enrollment.student_id);
          const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
          const verificationCode = Math.random().toString(36).substr(2, 12).toUpperCase();

          const certificate = await certificateAPI.create({
            student_id: enrollment.student_id,
            enrollment_id: enrollment.id,
            formation_title: enrollment.formation_title || "Formation",
            certificate_number: certificateNumber,
            verification_code: verificationCode,
            issue_date: new Date().toISOString().split("T")[0],
            completion_date: new Date().toISOString().split("T")[0],
            grade: Math.round(avgGrade * 10) / 10,
            attendance_rate: Math.round(attendanceRate * 10) / 10,
            status: "actif",
          });
          created.push(certificate);
        }
      }

      return created;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast.success(`${created.length} certificat(s) généré(s)`);
    },
    onError: () => {
      toast.error("Erreur lors de la génération automatique");
    },
  });

  const revokeCertificateMutation = useMutation({
    mutationFn: (id) => certificateAPI.update(id, { status: "révoqué" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast.success("Certificat révoqué");
    },
    onError: () => toast.error("Erreur lors de la révocation"),
  });

  const filteredCertificates = certificates.filter((cert) => {
    const student = students.find((s) => s.id === cert.student_id);
    const studentName = `${student?.first_name || ""} ${student?.last_name || ""}`.toLowerCase();
    return (
      studentName.includes(searchQuery.toLowerCase()) ||
      (cert.certificate_number || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const eligibleCount = enrollments.filter((e) => {
    if (e.status !== "terminé") return false;
    const existing = certificates.find((c) => c.enrollment_id === e.id);
    if (existing) return false;
    const enrollmentGrades = grades.filter((g) => g.enrollment_id === e.id);
    if (enrollmentGrades.length === 0) return false;
    const avgGrade =
      enrollmentGrades.reduce((sum, g) => sum + ((g.value / g.max_value) * 20 || 0), 0) / enrollmentGrades.length;
    const enrollmentAttendances = attendances.filter((a) => a.enrollment_id === e.id);
    const attendanceRate =
      enrollmentAttendances.length > 0
        ? (enrollmentAttendances.filter((a) => a.status === "présent").length / enrollmentAttendances.length) * 100
        : 0;
    return avgGrade >= 10 && attendanceRate >= 75;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900">Certificats</h1>
          <p className="text-slate-600 mt-1">Gestion et génération automatique des certificats</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowGenerator(true)}
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            <FileText className="h-4 w-4 mr-2" />
            Nouvelle Certification
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Certificats Actifs</p>
                <h3 className="text-3xl font-bold text-green-900 mt-2">
                  {certificates.filter((c) => c.status === "actif").length}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-green-600 shadow-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Éligibles</p>
                <h3 className="text-3xl font-bold text-blue-900 mt-2">{eligibleCount}</h3>
              </div>
              <div className="p-3 rounded-xl bg-blue-600 shadow-lg">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Révoqués</p>
                <h3 className="text-3xl font-bold text-red-900 mt-2">
                  {certificates.filter((c) => c.status === "révoqué").length}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-red-600 shadow-lg">
                <XCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Rechercher par étudiant ou numéro de certificat..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <CardTitle>Liste des Certificats</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {filteredCertificates.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">Aucun certificat trouvé</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCertificates.map((cert) => {
                const student = students.find((s) => s.id === cert.student_id);
                return (
                  <div
                    key={cert.id}
                    className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-slate-900">
                            {student?.first_name} {student?.last_name}
                          </h4>
                          <Badge
                            variant="outline"
                            className={
                              cert.status === "actif"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }
                          >
                            {cert.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{cert.formation_title}</p>
                        <div className="flex gap-4 mt-2 text-xs text-slate-500">
                          <span>N° {cert.certificate_number}</span>
                          <span>Note: {cert.grade}/20</span>
                          <span>Présence: {cert.attendance_rate}%</span>
                          <span>
                            Émis le{" "}
                            {cert.issue_date && format(new Date(cert.issue_date), "d MMM yyyy", { locale: fr })}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCertificate(cert)}
                        >
                          <Award className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                        {cert.status === "actif" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm("Révoquer ce certificat ?")) {
                                revokeCertificateMutation.mutate(cert.id);
                              }
                            }}
                            className="text-red-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {showGenerator && (
        <CertificateGenerator
          open={showGenerator}
          onClose={() => setShowGenerator(false)}
          students={students}
          enrollments={enrollments}
        />
      )}

      {selectedCertificate && (
        <CertificatePreview
          certificate={selectedCertificate}
          student={students.find((s) => s.id === selectedCertificate.student_id)}
          open={!!selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </div>
  );
}
