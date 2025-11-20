// ======================== src/api/localDB.js ========================================= //
let _id = 1000;
const nextId = () => (++_id).toString();

const nowIso = () => new Date().toISOString();

function clone(v) { return JSON.parse(JSON.stringify(v)); }

function matchFilter(item, filterObj = {}) {
  // simple match: every key in filterObj must equal item's value (loose)
  return Object.entries(filterObj).every(([k, v]) => {
    if (v === undefined || v === null) return true;
    return item[k] === v;
  });
}

function makeEntity(initial = []) {
  const list = clone(initial);
  return {
    async list(sort = null, limit = 1000) {
      // sort can be "-created_date" or "created_date" but our items use created_date
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
      const arr = list.filter((it) => matchFilter(it, filterObj));
      return clone(arr);
    },
    async create(data) {
      const item = {
        id: nextId(),
        created_date: nowIso(),
        ...data,
      };
      list.push(item);
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
      const [removed] = list.splice(idx, 1);
      return clone(removed);
    },
    // expose internal for tests/debug (not required)
    _dump() { return clone(list); },
  };
}

/* ---------------- Sample initial data ---------------- */
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
    bio: "Formateur expérimenté en gestion et comptabilité.",
    status: "actif",
    hire_date: "2021-09-01",
    hourly_rate: 15000,
    availability: [
      { day: "Lundi", start_time: "09:00", end_time: "12:00" },
      { day: "Mercredi", start_time: "13:00", end_time: "17:00" }
    ],
  },
  {
    id: "t2",
    created_date: nowIso(),
    registration_number: "T-2024-002",
    first_name: "Aina",
    last_name: "Rasoa",
    email: "aina.rasoa@example.com",
    phone: "+261 34 98 765 43",
    photo_url: "",
    specialties: ["Marketing", "Communication"],
    bio: "",
    status: "congé",
    hire_date: "2020-02-15",
    hourly_rate: 12000,
    availability: [],
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

const sessionsInit = [
  {
    id: "se1",
    created_date: nowIso(),
    formation_id: "f1",
    teacher_id: "t1",
    start_date: "2025-11-01",
    end_date: "2025-11-30",
    room: "Salle A",
    status: "en cours",
  },
  {
    id: "se2",
    created_date: nowIso(),
    formation_id: "f2",
    teacher_id: "t2",
    start_date: "2025-12-01",
    end_date: "2025-12-30",
    room: "Salle B",
    status: "prévue",
  },
];

const enrollmentsInit = [
  { id: "en1", created_date: nowIso(), student_id: "s1", session_id: "se1", status: "actif" }
];

const invoicesInit = [
  { id: "inv1", created_date: nowIso(), invoice_number: "FAC-001", enrollment_id: "en1", amount: 150000, status: "payée", due_date: "2025-11-15" }
];

/* ---------------- Entities ---------------- */
export const teacherAPI = makeEntity(teachersInit);
export const studentAPI = makeEntity(studentsInit);
export const sessionAPI = makeEntity(sessionsInit);
export const enrollmentAPI = makeEntity(enrollmentsInit);
export const invoiceAPI = makeEntity(invoicesInit);

/* ---------------- Upload fake API ---------------- */
export const uploadAPI = {
  // simulate a file upload: return an object { file_url }
  // If passed a File object in browser, use URL.createObjectURL when available.
  async UploadFile({ file }) {
    return new Promise((resolve) => {
      try {
        if (typeof window !== "undefined" && file && typeof URL !== "undefined" && URL.createObjectURL) {
          const url = URL.createObjectURL(file);
          // return quickly
          resolve({ file_url: url });
        } else {
          // fallback: return data placeholder
          resolve({ file_url: `data:application/octet-stream;name=${file?.name || "file"}` });
        }
      } catch (e) {
        resolve({ file_url: "" });
      }
    });
  }
};

/* ---------------- Default export for compatibility if someone imports default ---------------- */
export default {
  teacherAPI,
  studentAPI,
  sessionAPI,
  enrollmentAPI,
  invoiceAPI,
  uploadAPI,
};
