import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Génère un PDF professionnel pour la feuille de présence quotidienne
 * Style ASMiL avec statistiques et mise en page améliorée
 */
export function generateAttendancePDF({
  session,
  date,
  enrollments,
  students,
  attendances,
}) {
  const doc = new jsPDF("p", "mm", "a4");

  // Filtrer les présences pour cette date
  const dateStr = typeof date === 'string' ? date : format(new Date(date), 'yyyy-MM-dd');
  const dayAttendances = attendances.filter(a => {
    const attDate = typeof a.date === 'string' ? a.date.split('T')[0] : format(new Date(a.date), 'yyyy-MM-dd');
    return attDate === dateStr;
  });

  // Calculer les statistiques
  const stats = {
    present: dayAttendances.filter(a => a.status === "présent").length,
    absent: dayAttendances.filter(a => a.status === "absent").length,
    retard: dayAttendances.filter(a => a.status === "retard").length,
    excusé: dayAttendances.filter(a => a.status === "excusé").length,
    total: enrollments.length
  };
  stats.rate = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0;

  // ===========================================
  //  🔴 HEADER ROUGE ASMiL
  // ===========================================
  doc.setFillColor(200, 0, 0);
  doc.rect(0, 0, 210, 28, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("ASMiL - Feuille de Présence", 105, 12, { align: "center" });

  // Date formatée
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const formattedDate = format(new Date(date), "EEEE d MMMM yyyy", { locale: fr });
  doc.text(formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1), 105, 22, { align: "center" });

  // ===========================================
  //  📝 INFOS SESSION
  // ===========================================
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  const moduleName = session?.module?.title || session?.module_title || "Module inconnu";
  const room = session?.room || "-";
  const teacher = session?.teacher
    ? `${session.teacher.first_name} ${session.teacher.last_name}`
    : "Non assigné";

  doc.setFont("helvetica", "bold");
  doc.text("Session :", 10, 38);
  doc.setFont("helvetica", "normal");
  doc.text(moduleName, 35, 38);

  doc.setFont("helvetica", "bold");
  doc.text("Salle :", 10, 44);
  doc.setFont("helvetica", "normal");
  doc.text(room, 25, 44);

  doc.setFont("helvetica", "bold");
  doc.text("Professeur :", 10, 50);
  doc.setFont("helvetica", "normal");
  doc.text(teacher, 40, 50);

  // ===========================================
  //  📊 STATISTIQUES (Cards style)
  // ===========================================
  const statsY = 58;
  const cardWidth = 36;
  const cardHeight = 22;
  const startX = 12;
  const gap = 4;

  // Présents - Vert
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(startX, statsY, cardWidth, cardHeight, 3, 3, "F");
  doc.setDrawColor(34, 197, 94);
  doc.roundedRect(startX, statsY, cardWidth, cardHeight, 3, 3, "S");
  doc.setFontSize(9);
  doc.setTextColor(22, 101, 52);
  doc.text("Présents", startX + cardWidth / 2, statsY + 8, { align: "center" });
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(String(stats.present), startX + cardWidth / 2, statsY + 17, { align: "center" });

  // Absents - Rouge
  const card2X = startX + cardWidth + gap;
  doc.setFillColor(254, 226, 226);
  doc.roundedRect(card2X, statsY, cardWidth, cardHeight, 3, 3, "F");
  doc.setDrawColor(239, 68, 68);
  doc.roundedRect(card2X, statsY, cardWidth, cardHeight, 3, 3, "S");
  doc.setFontSize(9);
  doc.setTextColor(153, 27, 27);
  doc.setFont("helvetica", "normal");
  doc.text("Absents", card2X + cardWidth / 2, statsY + 8, { align: "center" });
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(String(stats.absent), card2X + cardWidth / 2, statsY + 17, { align: "center" });

  // Retards - Orange
  const card3X = card2X + cardWidth + gap;
  doc.setFillColor(255, 237, 213);
  doc.roundedRect(card3X, statsY, cardWidth, cardHeight, 3, 3, "F");
  doc.setDrawColor(249, 115, 22);
  doc.roundedRect(card3X, statsY, cardWidth, cardHeight, 3, 3, "S");
  doc.setFontSize(9);
  doc.setTextColor(154, 52, 18);
  doc.setFont("helvetica", "normal");
  doc.text("Retards", card3X + cardWidth / 2, statsY + 8, { align: "center" });
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(String(stats.retard), card3X + cardWidth / 2, statsY + 17, { align: "center" });

  // Excusés - Bleu
  const card4X = card3X + cardWidth + gap;
  doc.setFillColor(219, 234, 254);
  doc.roundedRect(card4X, statsY, cardWidth, cardHeight, 3, 3, "F");
  doc.setDrawColor(59, 130, 246);
  doc.roundedRect(card4X, statsY, cardWidth, cardHeight, 3, 3, "S");
  doc.setFontSize(9);
  doc.setTextColor(30, 64, 175);
  doc.setFont("helvetica", "normal");
  doc.text("Excusés", card4X + cardWidth / 2, statsY + 8, { align: "center" });
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(String(stats.excusé), card4X + cardWidth / 2, statsY + 17, { align: "center" });

  // Taux - Violet
  const card5X = card4X + cardWidth + gap;
  doc.setFillColor(243, 232, 255);
  doc.roundedRect(card5X, statsY, cardWidth, cardHeight, 3, 3, "F");
  doc.setDrawColor(147, 51, 234);
  doc.roundedRect(card5X, statsY, cardWidth, cardHeight, 3, 3, "S");
  doc.setFontSize(9);
  doc.setTextColor(88, 28, 135);
  doc.setFont("helvetica", "normal");
  doc.text("Taux", card5X + cardWidth / 2, statsY + 8, { align: "center" });
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`${stats.rate}%`, card5X + cardWidth / 2, statsY + 17, { align: "center" });

  // ===========================================
  //  📄 TABLEAU PRINCIPAL
  // ===========================================
  const rows = enrollments.map((enr, index) => {
    const attendance = dayAttendances.find((a) => a.enrollment_id === enr.id);

    // Chercher l'étudiant
    const student = enr.student || students.find((s) => s.id === enr.student_id);
    const name = student
      ? `${student.first_name} ${student.last_name}`
      : "Étudiant inconnu";
    const matricule = student?.registration_number || "-";

    let status = attendance?.status || "non enregistré";
    let note = attendance?.notes || "";

    return [index + 1, matricule, name, capitalize(status), note || "-"];
  });

  autoTable(doc, {
    startY: 88,
    head: [["#", "Matricule", "Étudiant", "Statut", "Notes"]],
    body: rows,
    headStyles: {
      fillColor: [200, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { halign: "center", cellWidth: 30 },
      2: { cellWidth: 60 },
      3: { halign: "center", cellWidth: 30 },
      4: { cellWidth: 50 },
    },
    // Style conditionnel pour les statuts
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 3) {
        const status = data.cell.raw.toLowerCase();
        if (status === 'présent') {
          data.cell.styles.textColor = [22, 101, 52];
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'absent') {
          data.cell.styles.textColor = [153, 27, 27];
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'retard') {
          data.cell.styles.textColor = [154, 52, 18];
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'excusé') {
          data.cell.styles.textColor = [30, 64, 175];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  // ===========================================
  //  ✍️ ZONE SIGNATURE
  // ===========================================
  const finalY = doc.lastAutoTable.finalY + 15;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100);

  doc.text("Signature du Responsable :", 10, finalY);
  doc.line(10, finalY + 15, 80, finalY + 15);

  doc.text("Date & Cachet :", 120, finalY);
  doc.line(120, finalY + 15, 190, finalY + 15);

  // ===========================================
  //  📌 PIED DE PAGE
  // ===========================================
  const pageCount = doc.internal.getNumberOfPages();
  const today = format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr });

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`ASMiL — Généré le ${today}`, 10, 290);
    doc.text(`Page ${i} / ${pageCount}`, 190, 290, { align: "right" });
  }

  // ===========================================
  //  💾 EXPORT
  // ===========================================
  const fileName = `presence_${dateStr}_${moduleName.replace(/\s+/g, '_').toLowerCase()}.pdf`;
  doc.save(fileName);
}

/**
 * Génère un rapport PDF de présence pour une période donnée
 */
export function generateAttendanceReportPDF({
  startDate,
  endDate,
  attendances,
  students,
  sessions,
  modules
}) {
  const doc = new jsPDF("p", "mm", "a4");

  // Calculer les statistiques globales
  const stats = {
    present: attendances.filter(a => a.status === "présent").length,
    absent: attendances.filter(a => a.status === "absent").length,
    retard: attendances.filter(a => a.status === "retard").length,
    excusé: attendances.filter(a => a.status === "excusé").length,
    total: attendances.length
  };
  stats.rate = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0;

  // Header
  doc.setFillColor(200, 0, 0);
  doc.rect(0, 0, 210, 28, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("ASMiL - Rapport de Présence", 105, 12, { align: "center" });

  const formattedStart = format(new Date(startDate), "d MMMM yyyy", { locale: fr });
  const formattedEnd = format(new Date(endDate), "d MMMM yyyy", { locale: fr });
  doc.setFontSize(12);
  doc.text(`Du ${formattedStart} au ${formattedEnd}`, 105, 22, { align: "center" });

  // Statistiques
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Statistiques Globales", 10, 40);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Total enregistrements: ${stats.total}`, 15, 50);
  doc.text(`Présents: ${stats.present} (${stats.rate}%)`, 15, 56);
  doc.text(`Absents: ${stats.absent}`, 15, 62);
  doc.text(`Retards: ${stats.retard}`, 15, 68);
  doc.text(`Excusés: ${stats.excusé}`, 15, 74);

  // Pied de page
  const pageCount = doc.internal.getNumberOfPages();
  const today = format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr });

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`ASMiL — Généré le ${today}`, 10, 290);
    doc.text(`Page ${i} / ${pageCount}`, 190, 290, { align: "right" });
  }

  doc.save(`rapport_presence_${startDate}_${endDate}.pdf`);
}

// Helper
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
