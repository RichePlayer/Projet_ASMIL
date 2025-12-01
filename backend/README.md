# Documentation API Backend - ASMiL

## Vue d'ensemble

API REST complète pour le système de gestion de formation ASMiL. Toutes les routes sont organisées par module avec authentification JWT et gestion des permissions basée sur les rôles.

## Authentification

### Configuration
- **Type**: JWT (JSON Web Token)
- **Header**: `Authorization: Bearer <token>`
- **Rôles**: `Admin`, `Gestionnaire`

### Routes d'authentification

#### Inscription
```http
POST /api/auth/register
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Admin"
}
```

#### Connexion
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Vérifier le token
```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

## Module Étudiants

**Base URL**: `/api/students`
**Permissions**: Admin, Gestionnaire

### Endpoints

| Méthode | Route | Description | Permission |
|---------|-------|-------------|------------|
| POST | `/` | Créer un étudiant | Admin, Gestionnaire |
| GET | `/` | Lister les étudiants | Admin, Gestionnaire |
| GET | `/:id` | Obtenir un étudiant | Admin, Gestionnaire |
| GET | `/:id/stats` | Statistiques d'un étudiant | Admin, Gestionnaire |
| PUT | `/:id` | Mettre à jour un étudiant | Admin, Gestionnaire |
| DELETE | `/:id` | Supprimer un étudiant | Admin |

### Paramètres de requête (GET /)
- `page` - Numéro de page (défaut: 1)
- `limit` - Éléments par page (défaut: 10)
- `status` - Filtrer par statut (actif, inactif)
- `search` - Recherche par nom, email, numéro

---

## Module Formations

**Base URL**: `/api/formations`

### Endpoints

| Méthode | Route | Description | Permission |
|---------|-------|-------------|------------|
| GET | `/` | Lister les formations | Public |
| GET | `/:id` | Obtenir une formation | Public |
| GET | `/categories/all` | Lister les catégories | Public |
| POST | `/` | Créer une formation | Admin |
| PUT | `/:id` | Mettre à jour une formation | Admin |
| DELETE | `/:id` | Supprimer une formation | Admin |
| POST | `/:id/modules` | Ajouter un module | Admin |
| PUT | `/modules/:moduleId` | Mettre à jour un module | Admin |
| DELETE | `/modules/:moduleId` | Supprimer un module | Admin |
| POST | `/categories` | Créer une catégorie | Admin |

### Paramètres de requête (GET /)
- `page`, `limit` - Pagination
- `category_id` - Filtrer par catégorie
- `type` - Filtrer par type
- `search` - Recherche par titre/description

---

## Module Enseignants

**Base URL**: `/api/teachers`
**Permissions**: Admin, Gestionnaire

### Endpoints

| Méthode | Route | Description | Permission |
|---------|-------|-------------|------------|
| POST | `/` | Créer un enseignant | Admin |
| GET | `/` | Lister les enseignants | Admin, Gestionnaire |
| GET | `/:id` | Obtenir un enseignant | Admin, Gestionnaire |
| GET | `/:id/stats` | Statistiques d'un enseignant | Admin, Gestionnaire |
| GET | `/:id/availability` | Disponibilité d'un enseignant | Admin, Gestionnaire |
| PUT | `/:id` | Mettre à jour un enseignant | Admin |
| DELETE | `/:id` | Supprimer un enseignant | Admin |

### Paramètres de requête
- `page`, `limit` - Pagination
- `status` - Filtrer par statut
- `specialty` - Filtrer par spécialité
- `search` - Recherche
- `start_date`, `end_date` - Pour disponibilité

---

## Module Sessions

**Base URL**: `/api/sessions`
**Permissions**: Admin, Gestionnaire

### Endpoints

| Méthode | Route | Description | Permission |
|---------|-------|-------------|------------|
| POST | `/` | Créer une session | Admin, Gestionnaire |
| GET | `/` | Lister les sessions | Admin, Gestionnaire |
| GET | `/:id` | Obtenir une session | Admin, Gestionnaire |
| GET | `/:id/stats` | Statistiques d'une session | Admin, Gestionnaire |
| PUT | `/:id` | Mettre à jour une session | Admin, Gestionnaire |
| DELETE | `/:id` | Supprimer une session | Admin |

### Paramètres de requête
- `page`, `limit` - Pagination
- `formation_id` - Filtrer par formation
- `teacher_id` - Filtrer par enseignant
- `status` - Filtrer par statut
- `start_date`, `end_date` - Filtrer par dates

---

## Module Inscriptions

**Base URL**: `/api/enrollments`
**Permissions**: Admin, Gestionnaire

### Endpoints

| Méthode | Route | Description | Permission |
|---------|-------|-------------|------------|
| POST | `/` | Créer une inscription | Admin, Gestionnaire |
| GET | `/` | Lister les inscriptions | Admin, Gestionnaire |
| GET | `/:id` | Obtenir une inscription | Admin, Gestionnaire |
| GET | `/:id/balance` | Solde d'une inscription | Admin, Gestionnaire |
| PUT | `/:id` | Mettre à jour une inscription | Admin, Gestionnaire |
| DELETE | `/:id` | Supprimer une inscription | Admin |

### Paramètres de requête
- `page`, `limit` - Pagination
- `student_id` - Filtrer par étudiant
- `session_id` - Filtrer par session
- `status` - Filtrer par statut

---

## Module Factures

**Base URL**: `/api/invoices`
**Permissions**: Admin, Gestionnaire

### Endpoints

| Méthode | Route | Description | Permission |
|---------|-------|-------------|------------|
| POST | `/` | Créer une facture | Admin, Gestionnaire |
| GET | `/` | Lister les factures | Admin, Gestionnaire |
| GET | `/overdue` | Factures en retard | Admin, Gestionnaire |
| GET | `/stats` | Statistiques financières | Admin |
| GET | `/:id` | Obtenir une facture | Admin, Gestionnaire |
| PUT | `/:id` | Mettre à jour une facture | Admin, Gestionnaire |
| DELETE | `/:id` | Supprimer une facture | Admin |

### Paramètres de requête
- `page`, `limit` - Pagination
- `enrollment_id` - Filtrer par inscription
- `status` - Filtrer par statut
- `overdue` - Factures en retard (true/false)
- `start_date`, `end_date` - Pour statistiques

---

## Module Paiements

**Base URL**: `/api/payments`
**Permissions**: Admin, Gestionnaire

### Endpoints

| Méthode | Route | Description | Permission |
|---------|-------|-------------|------------|
| POST | `/` | Enregistrer un paiement | Admin, Gestionnaire |
| GET | `/` | Lister les paiements | Admin, Gestionnaire |
| GET | `/stats` | Statistiques de paiements | Admin |
| GET | `/:id` | Obtenir un paiement | Admin, Gestionnaire |
| PUT | `/:id` | Mettre à jour un paiement | Admin |
| DELETE | `/:id` | Supprimer un paiement | Admin |

**Note**: La création d'un paiement met automatiquement à jour le statut de la facture et de l'inscription.

### Paramètres de requête
- `page`, `limit` - Pagination
- `invoice_id` - Filtrer par facture
- `method` - Filtrer par méthode de paiement
- `start_date`, `end_date` - Filtrer par dates

---

## Module Présences

**Base URL**: `/api/attendances`
**Permissions**: Admin, Gestionnaire

### Endpoints

| Méthode | Route | Description | Permission |
|---------|-------|-------------|------------|
| POST | `/` | Enregistrer une présence | Admin, Gestionnaire |
| POST | `/bulk` | Enregistrement en masse | Admin, Gestionnaire |
| GET | `/` | Lister les présences | Admin, Gestionnaire |
| GET | `/:id` | Obtenir une présence | Admin, Gestionnaire |
| GET | `/enrollment/:enrollment_id/rate` | Taux de présence | Admin, Gestionnaire |
| PUT | `/:id` | Mettre à jour une présence | Admin, Gestionnaire |
| DELETE | `/:id` | Supprimer une présence | Admin |

### Statuts de présence
- `présent`
- `absent`
- `retard`
- `excusé`

---

## Module Notes

**Base URL**: `/api/grades`
**Permissions**: Admin, Gestionnaire

### Endpoints

| Méthode | Route | Description | Permission |
|---------|-------|-------------|------------|
| POST | `/` | Créer une note | Admin, Gestionnaire |
| GET | `/` | Lister les notes | Admin, Gestionnaire |
| GET | `/:id` | Obtenir une note | Admin, Gestionnaire |
| GET | `/enrollment/:enrollment_id/average` | Calculer la moyenne | Admin, Gestionnaire |
| GET | `/enrollment/:enrollment_id/report` | Bulletin d'un étudiant | Admin, Gestionnaire |
| PUT | `/:id` | Mettre à jour une note | Admin, Gestionnaire |
| DELETE | `/:id` | Supprimer une note | Admin |

**Note**: Les moyennes sont calculées avec pondération et normalisées sur 20.

---

## Module Certificats

**Base URL**: `/api/certificates`

### Endpoints

| Méthode | Route | Description | Permission |
|---------|-------|-------------|------------|
| GET | `/verify/:certificate_number` | Vérifier un certificat | Public |
| POST | `/` | Générer un certificat | Admin, Gestionnaire |
| GET | `/` | Lister les certificats | Admin, Gestionnaire |
| GET | `/:id` | Obtenir un certificat | Admin, Gestionnaire |
| PUT | `/:id` | Mettre à jour un certificat | Admin |
| DELETE | `/:id` | Supprimer un certificat | Admin |

**Note**: Les numéros de certificat sont générés automatiquement au format `CERT-YYYY-XXXXX`.

---

## Module Annonces

**Base URL**: `/api/announcements`

### Endpoints

| Méthode | Route | Description | Permission |
|---------|-------|-------------|------------|
| GET | `/active` | Annonces actives | Public |
| POST | `/` | Créer une annonce | Admin |
| GET | `/` | Lister les annonces | Admin, Gestionnaire |
| GET | `/:id` | Obtenir une annonce | Admin, Gestionnaire |
| PUT | `/:id` | Mettre à jour une annonce | Admin |
| DELETE | `/:id` | Supprimer une annonce | Admin |

### Types d'annonces
- `information`
- `urgence`
- `événement`

### Audiences cibles
- `tous`
- `étudiants`
- `enseignants`

---

## Routes Utilitaires

### Health Check
```http
GET /api/health
```
Vérifie que le serveur fonctionne.

### Database Check
```http
GET /api/db-check
```
Vérifie la connexion à la base de données.

---

## Codes de statut HTTP

- `200` - Succès
- `201` - Créé avec succès
- `400` - Requête invalide
- `401` - Non authentifié
- `403` - Accès refusé (permissions insuffisantes)
- `404` - Ressource non trouvée
- `500` - Erreur serveur

---

## Exemples de réponses

### Succès
```json
{
  "message": "Opération réussie",
  "data": { ... }
}
```

### Erreur
```json
{
  "message": "Description de l'erreur",
  "error": "Détails techniques"
}
```

### Pagination
```json
{
  "items": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

## Variables d'environnement

Créer un fichier `.env` à la racine du projet backend :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/asmil_db"
JWT_SECRET="votre_secret_jwt_tres_securise"
PORT=3000
```

---

## Démarrage du serveur

```bash
# Installation des dépendances
npm install

# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:3000` par défaut.
