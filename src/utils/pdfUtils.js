import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formate un nombre avec des espaces comme séparateurs de milliers
 */
const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

/**
 * Génère un reçu de paiement en PDF
 */
export const generatePaymentReceipt = (payment) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const primaryColor = [220, 38, 38];
    const textColor = [51, 65, 85];
    const lightGray = [241, 245, 249];

    // EN-TÊTE
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ASMiL', 20, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Academie Superieure de Management et Leadership', 20, 28);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RECU DE PAIEMENT', pageWidth - 20, 25, { align: 'right' });

    // TAMPON PAYE
    doc.setTextColor(22, 163, 74);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.15 }));
    doc.text('PAYE', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
    doc.restoreGraphicsState();

    let yPos = 55;
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('N° Recu : ' + payment.id, 20, yPos);
    doc.text('Date emission : ' + format(new Date(), 'dd MMMM yyyy', { locale: fr }), pageWidth - 20, yPos, { align: 'right' });
    yPos += 15;

    // INFORMATIONS FACTURE
    doc.setFillColor(...lightGray);
    doc.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('INFORMATIONS DE LA FACTURE', 20, yPos);
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const invoiceInfo = [
        ['Numero de facture', payment.invoice?.invoice_number || 'N/A'],
        ['Date de facture', payment.invoice?.invoice_date ? format(new Date(payment.invoice.invoice_date), 'dd MMMM yyyy', { locale: fr }) : 'N/A'],
        ['Montant total', formatNumber(parseFloat(payment.invoice?.amount || 0)) + ' Ar'],
    ];

    invoiceInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label + ' :', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 80, yPos);
        yPos += 7;
    });
    yPos += 5;

    // INFORMATIONS ETUDIANT
    doc.setFillColor(...lightGray);
    doc.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('INFORMATIONS DE L\'ETUDIANT', 20, yPos);
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const student = payment.invoice?.enrollment?.student;
    const studentInfo = [
        ['Nom complet', student ? student.first_name + ' ' + student.last_name : 'N/A'],
        ['Email', student?.email || 'N/A'],
        ['Telephone', student?.phone || 'N/A'],
    ];

    studentInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label + ' :', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 80, yPos);
        yPos += 7;
    });
    yPos += 5;

    // FORMATION
    doc.setFillColor(...lightGray);
    doc.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('FORMATION', 20, yPos);
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Formation : ' + (payment.invoice?.enrollment?.session?.module?.title || 'N/A'), 20, yPos);
    yPos += 15;

    // DETAILS PAIEMENT
    doc.setFillColor(...primaryColor);
    doc.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('DETAILS DU PAIEMENT', 20, yPos);
    yPos += 12;
    doc.setTextColor(...textColor);
    doc.setFontSize(10);

    const paymentDetails = [
        ['Date de paiement', payment.payment_date ? format(new Date(payment.payment_date), 'dd MMMM yyyy', { locale: fr }) : 'N/A'],
        ['Mode de paiement', payment.method || 'N/A'],
        ['Reference', payment.transaction_reference || '-'],
    ];

    paymentDetails.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label + ' :', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 80, yPos);
        yPos += 7;
    });

    // MONTANT PAYE
    yPos += 5;
    doc.setFillColor(220, 252, 231);
    doc.rect(15, yPos - 5, pageWidth - 30, 15, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(22, 163, 74);
    doc.text('MONTANT PAYE :', 20, yPos + 5);
    doc.setFontSize(18);
    doc.text(formatNumber(parseFloat(payment.amount || 0)) + ' Ar', pageWidth - 20, yPos + 5, { align: 'right' });
    yPos += 25;

    // HISTORIQUE
    if (payment.invoice?.payments && payment.invoice.payments.length > 0) {
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('HISTORIQUE DES PAIEMENTS', 20, yPos);
        yPos += 5;

        const tableData = payment.invoice.payments.map((p) => [
            format(new Date(p.payment_date || p.created_at), 'dd/MM/yyyy', { locale: fr }),
            formatNumber(parseFloat(p.amount)) + ' Ar',
            p.method || 'N/A',
            p.transaction_reference || '-',
            p.id === payment.id ? 'Oui' : '',
        ]);

        doc.autoTable({
            startY: yPos,
            head: [['Date', 'Montant', 'Mode', 'Reference', 'Actuel']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { fontSize: 9, textColor: textColor },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { left: 20, right: 20 },
        });

        yPos = doc.lastAutoTable.finalY + 10;
    }

    // NOTES
    if (payment.notes) {
        yPos += 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Notes :', 20, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const splitNotes = doc.splitTextToSize(payment.notes, pageWidth - 40);
        doc.text(splitNotes, 20, yPos);
    }

    // PIED DE PAGE
    const footerY = pageHeight - 30;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(20, footerY, pageWidth - 20, footerY);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text('Ce recu a ete genere automatiquement par le systeme de gestion ASMiL', pageWidth / 2, footerY + 8, { align: 'center' });
    doc.text('Genere le ' + format(new Date(), 'dd/MM/yyyy a HH:mm', { locale: fr }), pageWidth / 2, footerY + 13, { align: 'center' });

    // SAUVEGARDE
    doc.save('Recu_Paiement_' + payment.id + '_' + format(new Date(), 'ddMMyyyy') + '.pdf');
};
