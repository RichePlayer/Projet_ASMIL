
// ======================== src/api/localDB.js ========================================= //

let _id = 3000;
const nextId = () => (++_id).toString();
const nowIso = () => new Date().toISOString();

function clone(v) {
  return JSON.parse(JSON.stringify(v));
}

function matchFilter(item, filterObj = {}) {
  return Object.entries(filterObj).every(([k, v]) => {
    if (v === undefined || v === null) return true;
    if (Array.isArray(v)) return v.includes(item[k]);
    return item[k] == v;
  });
}

/**
 * makeEntity - simple in-memory CRUD entity with list/filter/create/update/delete
 */
function makeEntity(initial = []) {
  const list = clone(initial);

  return {
    async list(sort = null, limit = 1000) {
      let arr = [...list];
      if (sort === "-created_date") {
        arr.sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""));
      } else if (sort === "created_date") {
        arr.sort((a, b) => (a.created_date || "").localeCompare(b.created_date || ""));
      }
      if (limit) arr = arr.slice(0, limit);
      return clone(arr);
    },

    async filter(filterObj = {}) {
      return clone(list.filter((it) => matchFilter(it, filterObj)));
    },

    async create(data) {
      const item = { id: nextId(), created_date: nowIso(), ...data };
      list.unshift(item);
      return clone(item);
    },

    async update(id, data) {
      const idx = list.findIndex((it) => it.id === id);
      if (idx === -1) throw new Error("Not found");
      list[idx] = { ...list[idx], ...data, updated_date: nowIso() };
      return clone(list[idx]);
    },

    async delete(id) {
      const idx = list.findIndex((it) => it.id === id);
      if (idx === -1) throw new Error("Not found");
      return clone(list.splice(idx, 1)[0]);
    },

    _dump() {
      return clone(list);
    },
  };
}

// ---------------------------------------------------------------------------
//                                INITIAL DATA
// ---------------------------------------------------------------------------

const categoriesInit = [
  { id: "c1", created_date: nowIso(), name: "Langue" },
  { id: "c2", created_date: nowIso(), name: "Informatique" },
  { id: "c3", created_date: nowIso(), name: "Entrepreneuriat" },
];

const formationsInit = [
  {
    id: "f1",
    created_date: nowIso(),
    category_id: "c2",
    title: "Bureautique",
    description: "Maîtriser les fonctions avancées d’Excel.",
    duration_months: 2,
    price: 89000,
    type: "certifiante",
    image_url: "",
    prerequisites: "Connaissances Excel de base",
  },
];

const modulesInit = [
  {
    id: "m1",
    created_date: nowIso(),
    formation_id: "f1",
    title: "Français",
    description: "Apprendre les bases du français",
    hours: 8,
    order: 1,
  }
];

const sessionsInit = [
  {
    id: "se1",
    created_date: nowIso(),
    formation_id: "f1",
    module_id: "m1",
    teacher_id: "t1",
    start_date: "2025-11-01",
    end_date: "2025-11-30",
    room: "Salle 01",
    capacity: 50,
    status: "en cours",
    schedule: [
      { day: "Lundi", start_time: "08:00", end_time: "12:00" },
    ],
  },
];

const teachersInit = [
  {
    id: "t1",
    created_date: nowIso(),
    registration_number: "T-2024-001",
    first_name: "Jean",
    last_name: "Rabet",
    email: "jean.rabet@example.com",
    phone: "+261 34 12 345 67",
    photo_url: "",
    specialties: ["Excel", "Comptabilité"],
    bio: "Formateur expérimenté.",
    status: "actif",
    hire_date: "2021-09-01",
    hourly_rate: 15000,
    availability: [
      { day: "Lundi", start_time: "08:00", end_time: "12:00" },
      { day: "Mercredi", start_time: "13:00", end_time: "17:00" },
    ],
  },
];

const studentsInit = [
  {
    id: "s1",
    created_date: nowIso(),
    registration_number: "ETU-2025-001",
    first_name: "Rija",
    last_name: "Rakoto",
    date_of_birth: "2005-03-12",
    gender: "Homme",
    email: "rija@example.com",
    phone_parent: "+261 34 11 222 33",
    address: "Antananarivo",
    status: "actif",
    enrollment_date: "2025-09-01",
    photo_url: "",
  },
];

const enrollmentsInit = [
  {
    id: "en1",
    created_date: nowIso(),
    student_id: "s1",
    session_id: "se1",
    status: "actif",
    total_amount: 89000,
    paid_amount: 89000,
    notes: "Premier acompte",
  },
];

const attendancesInit = [
  {
    id: "a1",
    created_date: nowIso(),
    enrollment_id: "en1",
    date: "2025-11-05",
    status: "présent",
    notes: "",
  },
];

const gradesInit = [
  {
    id: "g1",
    created_date: nowIso(),
    enrollment_id: "en1",
    evaluation_name: "Examen d’entrée",
    value: 15,
    max_value: 20,
    weight: 1,
    date: "2025-11-10",
    comments: "Bonne participation",
  },
];

// ⭐ Announcements (déjà ajouté précédemment)
const announcementsInit = [
  {
    id: "an1",
    created_date: nowIso(),
    title: "Bienvenue chez ASMiL",
    content: "Ceci est une annonce d’exemple.",
    type: "information",
    target_audience: "tous",
    published: true,
    publish_date: nowIso().split("T")[0],
    expiry_date: "",
  },
];

const invoicesInit = [
  {
    id: "inv1",
    created_date: nowIso(),
    invoice_number: "FAC-001",
    enrollment_id: "en1",
    amount: 89000,
    due_date: "2025-11-15",
    notes: "",
  },
];

const paymentsInit = [
  {
    id: "p1",
    created_date: nowIso(),
    invoice_id: "inv1",
    method: "espèces",
    amount: 80000,
    transaction_reference: "TXN-001",
    notes: "Acompte initial",
  },
];

// -----------------------------
// CERTIFICATES INIT
// -----------------------------
const certificatesInit = [
  {
    // id auto-generated
    id: "cert1",
    created_date: nowIso(),
    certificate_number: "ASMiL-2025-0001",
    student_id: "s1",
    formation_id: "f1",
    date_obtention: nowIso().split("T")[0],
    status: "valide", // valide|expiré|révoqué
    template: "default",
    notes: "Certificat d'exemple",
  },
];

// ---------------------------------------------------------------------------
//                                ENTITY APIS
// ---------------------------------------------------------------------------

export const categoryAPI = makeEntity(categoriesInit);
export const formationAPI = makeEntity(formationsInit);
export const moduleAPI = makeEntity(modulesInit);
export const sessionAPI = makeEntity(sessionsInit);
export const teacherAPI = makeEntity(teachersInit);
export const studentAPI = makeEntity(studentsInit);
export const enrollmentAPI = makeEntity(enrollmentsInit);
export const attendanceAPI = makeEntity(attendancesInit);
export const gradeAPI = makeEntity(gradesInit);

export const announcementAPI = makeEntity(announcementsInit);

export const invoiceAPI = makeEntity(invoicesInit);
export const paymentAPI = makeEntity(paymentsInit);

export const certificateAPI = makeEntity(certificatesInit); // <-- ajouté

// ---------------------------------------------------------------------------
//                       Financial & Certificate helpers
// ---------------------------------------------------------------------------

export async function getPaymentsForInvoice(invoiceId) {
  if (!invoiceId) return [];
  return paymentAPI.filter({ invoice_id: invoiceId });
}

export async function calculateInvoiceStatus(invoice) {
  if (!invoice) return "impayée";
  const payments = await getPaymentsForInvoice(invoice.id);
  const paidSum = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const invoiceAmount = Number(invoice.amount || 0);

  if (paidSum <= 0) return "impayée";
  if (paidSum >= invoiceAmount) return "payée";
  return "partielle";
}

export async function getInvoiceFinancialInfo(invoiceId) {
  const invoiceList = await invoiceAPI.filter({ id: invoiceId });
  const invoice = invoiceList[0];
  const total = Number(invoice?.amount || 0);
  const payments = await getPaymentsForInvoice(invoiceId);
  const paid = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const reste = Math.max(0, total - paid);
  const status = await calculateInvoiceStatus(invoice || { amount: total, id: invoiceId });
  return { paid, total, reste, status, payments, invoice: invoice || null };
}

export async function reconcileInvoicesStatus() {
  const allInvoices = await invoiceAPI.list();
  for (const inv of allInvoices) {
    const status = await calculateInvoiceStatus(inv);
    if (inv.status !== status) {
      try {
        await invoiceAPI.update(inv.id, { status });
      } catch { }
    }
  }
}

// ---------------------------------------------------------------------------
//                       Certificate helpers
// ---------------------------------------------------------------------------

/**
 * generateCertificateNumber(prefix = "ASMiL")
 * simple incremental certificate number generator: PREFIX-YYYY-XXXX
 */
export function generateCertificateNumber(prefix = "ASMiL") {
  const year = new Date().getFullYear();
  // count existing certificates to make sequence
  const seq = (certificateAPI._dump().length + 1).toString().padStart(4, "0");
  return `${prefix}-${year}-${seq}`;
}

/**
 * verifyCertificateByNumber(number)
 * returns certificate object or null
 */
export async function verifyCertificateByNumber(number) {
  if (!number) return null;
  const res = await certificateAPI.filter({ certificate_number: number });
  return res[0] || null;
}

/**
 * issueCertificate(payload)
 * convenience helper: fills certificate_number and created_date when missing
 */
export async function issueCertificate(data = {}) {
  const payload = { ...data };
  if (!payload.certificate_number) payload.certificate_number = generateCertificateNumber();
  if (!payload.date_obtention) payload.date_obtention = nowIso().split("T")[0];
  if (!payload.status) payload.status = "valide";
  const created = await certificateAPI.create(payload);
  return created;
}

// ---------------------------------------------------------------------------
//                                 UPLOAD MOCK
// ---------------------------------------------------------------------------

export const uploadAPI = {
  async UploadFile({ file }) {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && file && URL.createObjectURL) {
        resolve({ file_url: URL.createObjectURL(file) });
      } else {
        resolve({
          file_url: `data:application/octet-stream;name=${file?.name || "file"}`,
        });
      }
    });
  },
};

// ---------------------------------------------------------------------------
//                                 EXPORT DEFAULT
// ---------------------------------------------------------------------------

export default {
  categoryAPI,
  formationAPI,
  moduleAPI,
  sessionAPI,
  teacherAPI,
  studentAPI,
  enrollmentAPI,
  attendanceAPI,
  gradeAPI,

  announcementAPI,

  invoiceAPI,
  paymentAPI,

  certificateAPI, // <-- export

  uploadAPI,

  getPaymentsForInvoice,
  calculateInvoiceStatus,
  getInvoiceFinancialInfo,
  reconcileInvoicesStatus,

  // certificate helpers
  generateCertificateNumber,
  verifyCertificateByNumber,
  issueCertificate,
};
