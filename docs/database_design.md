# Conception de la Base de Données (PostgreSQL)

Ce document présente la conception complète de la base de données pour le système de gestion ASMiL.

## 1. Vue d'ensemble des Entités

Le système gère les entités principales suivantes :
- **Utilisateurs** : Administrateurs et Secrétaires.
- **Pédagogie** : Formations, Modules, Sessions, Enseignants.
- **Étudiants** : Inscriptions, Présences, Notes, Certificats.
- **Finance** : Factures, Paiements.
- **Communication** : Annonces.

## 2. Schéma Relationnel (Tables)

Voici la structure détaillée des tables pour PostgreSQL.

### 2.1. Gestion des Accès

#### `users`
Comptes pour l'administration du système.
| Colonne | Type | Description |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | Identifiant unique |
| `full_name` | VARCHAR(100) | Nom complet |
| `email` | VARCHAR(150) UNIQUE | Email de connexion |
| `password_hash` | VARCHAR(255) | Mot de passe haché |
| `role` | VARCHAR(50) | 'Admin' ou 'Gestionnaire' |
| `status` | VARCHAR(20) | 'active' ou 'inactive' |
| `last_login` | TIMESTAMP | Date de dernière connexion |
| `created_at` | TIMESTAMP DEFAULT NOW() | Date de création |

---

### 2.2. Catalogue de Formations

#### `categories`
Catégories de formations (ex: Langue, Bureautique).
| Colonne | Type | Description |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | Identifiant unique |
| `name` | VARCHAR(100) | Nom de la catégorie |
| `created_at` | TIMESTAMP DEFAULT NOW() | |

#### `formations`
Les formations proposées.
| Colonne | Type | Description |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | Identifiant unique |
| `category_id` | INT REFERENCES categories(id) | Clé étrangère vers Catégorie |
| `title` | VARCHAR(200) | Titre de la formation |
| `description` | TEXT | Description détaillée |
| `duration_months` | INT | Durée en mois |
| `price` | DECIMAL(10, 2) | Prix de la formation |
| `type` | VARCHAR(50) | 'certifiante', 'qualifiante', etc. |
| `prerequisites` | TEXT | Prérequis |
| `created_at` | TIMESTAMP DEFAULT NOW() | |

#### `modules`
Modules ou matières composant une formation.
| Colonne | Type | Description |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | Identifiant unique |
| `formation_id` | INT REFERENCES formations(id) | Clé étrangère vers Formation |
| `title` | VARCHAR(200) | Titre du module |
| `description` | TEXT | Contenu du module |
| `hours` | INT | Volume horaire |
| `order_index` | INT | Ordre d'affichage |
| `created_at` | TIMESTAMP DEFAULT NOW() | |

---

### 2.3. Gestion des Sessions et Enseignants

#### `teachers`
Formateurs et enseignants.
| Colonne | Type | Description |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | Identifiant unique |
| `registration_number` | VARCHAR(50) UNIQUE | Matricule (ex: T-2024-001) |
| `first_name` | VARCHAR(100) | Prénom |
| `last_name` | VARCHAR(100) | Nom |
| `email` | VARCHAR(150) UNIQUE | Email |
| `phone` | VARCHAR(50) | Téléphone |
| `specialties` | TEXT[] | Tableau des spécialités |
| `hourly_rate` | DECIMAL(10, 2) | Taux horaire |
| `status` | VARCHAR(20) | 'actif', 'inactif' |
| `created_at` | TIMESTAMP DEFAULT NOW() | |

#### `sessions`
Sessions de formation planifiées (Classes).
| Colonne | Type | Description |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | Identifiant unique |
| `formation_id` | INT REFERENCES formations(id) | Formation concernée |
| `teacher_id` | INT REFERENCES teachers(id) | Formateur principal |
| `start_date` | DATE | Date de début |
| `end_date` | DATE | Date de fin |
| `room` | VARCHAR(50) | Salle de cours |
| `capacity` | INT | Capacité max d'étudiants |
| `status` | VARCHAR(20) | 'planifiée', 'en cours', 'terminée' |
| `schedule` | JSONB | Emploi du temps (Jours/Heures) |
| `created_at` | TIMESTAMP DEFAULT NOW() | |

---

### 2.4. Étudiants et Suivi

#### `students`
Les apprenants.
| Colonne | Type | Description |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | Identifiant unique |
| `registration_number` | VARCHAR(50) UNIQUE | Matricule (ex: ETU-2025-001) |
| `first_name` | VARCHAR(100) | Prénom |
| `last_name` | VARCHAR(100) | Nom |
| `date_of_birth` | DATE | Date de naissance |
| `email` | VARCHAR(150) | Email de l'étudiant |
| `phone_parent` | VARCHAR(50) | Téléphone (Parent/Tuteur) |
| `address` | TEXT | Adresse |
| `status` | VARCHAR(20) | 'actif', 'inactif', 'diplômé' |
| `enrollment_date` | DATE | Date d'inscription au centre |
| `created_at` | TIMESTAMP DEFAULT NOW() | |

#### `enrollments`
Inscription d'un étudiant à une session spécifique.
| Colonne | Type | Description |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | Identifiant unique |
| `student_id` | INT REFERENCES students(id) | Étudiant |
| `session_id` | INT REFERENCES sessions(id) | Session |
| `status` | VARCHAR(20) | 'actif', 'abandon', 'complété' |
| `total_amount` | DECIMAL(10, 2) | Montant total dû pour cette session |
| `created_at` | TIMESTAMP DEFAULT NOW() | |

#### `attendances`
Suivi des présences.
| Colonne | Type | Description |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | Identifiant unique |
| `enrollment_id` | INT REFERENCES enrollments(id) | Lien vers l'inscription |
| `date` | DATE | Date du cours |
| `status` | VARCHAR(20) | 'présent', 'absent', 'retard' |
| `created_at` | TIMESTAMP DEFAULT NOW() | |

#### `grades`
Notes et évaluations.
| Colonne | Type | Description |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | Identifiant unique |
| `enrollment_id` | INT REFERENCES enrollments(id) | Lien vers l'inscription |
| `evaluation_name` | VARCHAR(100) | Nom de l'examen/devoir |
| `value` | DECIMAL(5, 2) | Note obtenue |
| `max_value` | DECIMAL(5, 2) | Note maximale (ex: 20) |
| `weight` | DECIMAL(5, 2) | Coefficient |
| `date` | DATE | Date de l'évaluation |
| `created_at` | TIMESTAMP DEFAULT NOW() | |

#### `certificates`
Certificats délivrés.
| Colonne | Type | Description |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | Identifiant unique |
| `certificate_number` | VARCHAR(100) UNIQUE | Numéro unique du certificat |
| `student_id` | INT REFERENCES students(id) | Étudiant certifié |
| `formation_id` | INT REFERENCES formations(id) | Formation validée |
| `date_obtention` | DATE | Date de délivrance |
| `status` | VARCHAR(20) | 'valide', 'révoqué' |
| `created_at` | TIMESTAMP DEFAULT NOW() | |

---

### 2.5. Finance

#### `invoices`
Factures générées pour les inscriptions.
| Colonne | Type | Description |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | Identifiant unique |
| `invoice_number` | VARCHAR(50) UNIQUE | Numéro de facture (ex: FAC-001) |
| `enrollment_id` | INT REFERENCES enrollments(id) | Inscription concernée |
| `amount` | DECIMAL(10, 2) | Montant à payer |
| `due_date` | DATE | Date d'échéance |
| `status` | VARCHAR(20) | 'payée', 'impayée', 'partielle' |
| `created_at` | TIMESTAMP DEFAULT NOW() | |

#### `payments`
Paiements reçus.
| Colonne | Type | Description |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | Identifiant unique |
| `invoice_id` | INT REFERENCES invoices(id) | Facture réglée |
| `amount` | DECIMAL(10, 2) | Montant versé |
| `method` | VARCHAR(50) | 'espèces', 'chèque', 'mobile money' |
| `transaction_reference` | VARCHAR(100) | Référence de transaction |
| `payment_date` | TIMESTAMP DEFAULT NOW() | Date du paiement |
| `created_at` | TIMESTAMP DEFAULT NOW() | |

---

### 2.6. Divers

#### `announcements`
Annonces et actualités.
| Colonne | Type | Description |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | Identifiant unique |
| `title` | VARCHAR(200) | Titre |
| `content` | TEXT | Contenu |
| `type` | VARCHAR(50) | 'information', 'urgence' |
| `published` | BOOLEAN | Statut de publication |
| `created_at` | TIMESTAMP DEFAULT NOW() | |
