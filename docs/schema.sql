-- Script de création de la base de données ASMiL (PostgreSQL)

-- 1. Table des Utilisateurs (Admin / Secrétaire)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Gestionnaire')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table des Catégories de Formation
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table des Formations
CREATE TABLE formations (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    duration_months INT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    type VARCHAR(50),
    image_url VARCHAR(255),
    prerequisites TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table des Modules
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    formation_id INT REFERENCES formations(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    hours INT,
    order_index INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table des Enseignants
CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(50),
    specialties TEXT[], -- Tableau de chaînes pour PostgreSQL
    bio TEXT,
    status VARCHAR(20) DEFAULT 'actif',
    hire_date DATE,
    hourly_rate DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Table des Sessions (Classes)
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    formation_id INT REFERENCES formations(id) ON DELETE CASCADE,
    teacher_id INT REFERENCES teachers(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    room VARCHAR(50),
    capacity INT,
    status VARCHAR(20) DEFAULT 'planifiée',
    schedule JSONB, -- Stockage flexible de l'emploi du temps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Table des Étudiants
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    email VARCHAR(150),
    phone_parent VARCHAR(50),
    address TEXT,
    status VARCHAR(20) DEFAULT 'actif',
    enrollment_date DATE DEFAULT CURRENT_DATE,
    photo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Table des Inscriptions (Lien Étudiant - Session)
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    session_id INT REFERENCES sessions(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'actif',
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Table des Présences
CREATE TABLE attendances (
    id SERIAL PRIMARY KEY,
    enrollment_id INT REFERENCES enrollments(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('présent', 'absent', 'retard', 'excusé')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Table des Notes
CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    enrollment_id INT REFERENCES enrollments(id) ON DELETE CASCADE,
    evaluation_name VARCHAR(100) NOT NULL,
    value DECIMAL(5, 2) NOT NULL,
    max_value DECIMAL(5, 2) NOT NULL DEFAULT 20,
    weight DECIMAL(5, 2) DEFAULT 1,
    date DATE,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Table des Certificats
CREATE TABLE certificates (
    id SERIAL PRIMARY KEY,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    formation_id INT REFERENCES formations(id) ON DELETE SET NULL,
    date_obtention DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'valide',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Table des Factures
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    enrollment_id INT REFERENCES enrollments(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'impayée',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Table des Paiements
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    invoice_id INT REFERENCES invoices(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    method VARCHAR(50),
    transaction_reference VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Table des Annonces
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'information',
    target_audience VARCHAR(50) DEFAULT 'tous',
    published BOOLEAN DEFAULT TRUE,
    publish_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les recherches courantes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_students_registration ON students(registration_number);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_session ON enrollments(session_id);
CREATE INDEX idx_invoices_enrollment ON invoices(enrollment_id);
