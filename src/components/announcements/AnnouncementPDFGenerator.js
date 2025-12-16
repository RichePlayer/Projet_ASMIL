import jsPDF from "jspdf";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Génère un PDF professionnel et épuré pour une annonce
 * Design simple et moderne sans bordures décoratives
 */
export const generateAnnouncementPDF = (announcement) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Colors by type
  const typeStyles = {
    information: { primary: [59, 130, 246], light: [239, 246, 255], label: "INFORMATION" },
    urgent: { primary: [239, 68, 68], light: [254, 242, 242], label: "URGENT" },
    événement: { primary: [168, 85, 247], light: [250, 245, 255], label: "ÉVÉNEMENT" },
    "session ouverte": { primary: [34, 197, 94], light: [240, 253, 244], label: "SESSION OUVERTE" },
  };

  const style = typeStyles[announcement.type] || typeStyles.information;

  // Format dates
  const publishDate = announcement.publish_date
    ? format(new Date(announcement.publish_date), "EEEE d MMMM yyyy", { locale: fr })
    : format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

  const expiryDate = announcement.expiry_date
    ? format(new Date(announcement.expiry_date), "d MMMM yyyy", { locale: fr })
    : null;

  // ===========================================
  //  🔴 HEADER ASMiL (compact)
  // ===========================================
  doc.setFillColor(220, 38, 38);
  doc.rect(0, 0, pageWidth, 28, "F");

  // Logo ASMiL
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("ASMiL", 15, 12);

  // Sous-titre
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(254, 226, 226);
  doc.text("Centre de Formation Professionnelle", 15, 20);

  // Date à droite
  doc.setFontSize(9);
  doc.text(format(new Date(), "d MMMM yyyy", { locale: fr }), pageWidth - 15, 16, { align: "right" });

  // ===========================================
  //  🏷️ BADGE TYPE
  // ===========================================
  const badgeY = 38;
  const badgeWidth = 65;
  const badgeHeight = 12;
  const badgeX = (pageWidth - badgeWidth) / 2;

  doc.setFillColor(...style.primary);
  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 6, 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(style.label, pageWidth / 2, badgeY + 8.5, { align: "center" });

  // ===========================================
  //  📋 TITRE
  // ===========================================
  const titleY = 68;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59);

  const titleLines = doc.splitTextToSize(announcement.title, contentWidth);
  titleLines.forEach((line, i) => {
    doc.text(line, pageWidth / 2, titleY + (i * 9), { align: "center" });
  });

  const titleEndY = titleY + (titleLines.length * 9) + 5;

  // ===========================================
  //  📅 MÉTADONNÉES
  // ===========================================
  // Ligne séparatrice
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, titleEndY, pageWidth - margin, titleEndY);

  const metaY = titleEndY + 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);

  // Date publication
  doc.text("Publié le " + publishDate.charAt(0).toUpperCase() + publishDate.slice(1), margin, metaY);

  // Public cible
  const targetLabel = announcement.target_audience === "tous" ? "Tout le monde"
    : announcement.target_audience === "étudiants" ? "Étudiants" : "Formateurs";
  doc.text("Public : " + targetLabel, pageWidth - margin, metaY, { align: "right" });

  // Ligne séparatrice
  doc.line(margin, metaY + 8, pageWidth - margin, metaY + 8);

  // ===========================================
  //  📝 CONTENU
  // ===========================================
  const contentStartY = metaY + 25;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(51, 65, 85);

  const contentLines = doc.splitTextToSize(announcement.content, contentWidth);
  const lineHeight = 7;
  let currentY = contentStartY;

  contentLines.forEach((line) => {
    if (currentY > pageHeight - 60) {
      doc.addPage();

      // Mini header page suivante
      doc.setFillColor(220, 38, 38);
      doc.rect(0, 0, pageWidth, 15, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text("ASMiL - Annonce (suite)", pageWidth / 2, 10, { align: "center" });

      currentY = 30;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(51, 65, 85);
    }
    doc.text(line, margin, currentY);
    currentY += lineHeight;
  });

  // ===========================================
  //  ⚠️ ENCADRÉ EXPIRATION
  // ===========================================
  if (expiryDate && currentY < pageHeight - 70) {
    const warningY = currentY + 15;

    doc.setFillColor(255, 251, 235);
    doc.roundedRect(margin, warningY, contentWidth, 20, 3, 3, "F");
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.8);
    doc.roundedRect(margin, warningY, contentWidth, 20, 3, 3, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(146, 64, 14);
    doc.text("Cette annonce expire le " + expiryDate, pageWidth / 2, warningY + 12, { align: "center" });
  }

  // ===========================================
  //  📌 PIED DE PAGE
  // ===========================================
  const footerY = pageHeight - 25;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text("ASMiL - Centre de Formation Professionnelle", margin, footerY + 8);
  doc.text(`Généré le ${format(new Date(), "d MMMM yyyy à HH:mm", { locale: fr })}`, pageWidth - margin, footerY + 8, { align: "right" });

  // ===========================================
  //  💾 EXPORT
  // ===========================================
  const fileName = `Annonce_${announcement.title.replace(/[^a-zA-Z0-9àâäéèêëïîôùûüç]/gi, '_').substring(0, 25)}.pdf`;
  doc.save(fileName);
};
