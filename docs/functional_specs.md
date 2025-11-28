# Spécifications Fonctionnelles Détaillées - ASMiL

Ce document détaille les fonctionnalités du système de gestion ASMiL, structuré par modules.

## 1. Module d'Administration et Sécurité

### 1.1. Authentification
- **Connexion Sécurisée** : Accès par email et mot de passe.
- **Rôles Utilisateurs** :
    - **Admin** : Accès complet à toutes les fonctionnalités et configurations système.
    - **Gestionnaire (Secrétaire)** : Accès limité à la gestion quotidienne (étudiants, paiements, inscriptions), sans accès aux paramètres système critiques ou à la suppression d'utilisateurs.
- **Audit Logs** : Traçabilité des actions sensibles (création, modification, suppression).

### 1.2. Gestion des Utilisateurs
- **CRUD Utilisateurs** : Création, lecture, mise à jour et suppression des comptes staff.
- **Gestion des Statuts** : Activation/Désactivation des comptes.
- **Réinitialisation de Mot de Passe** : Fonctionnalité pour réinitialiser les accès.

---

## 2. Module Pédagogique

### 2.1. Gestion des Formations
- **Catalogue** : Création et gestion des formations proposées (ex: Excel Avancé, Anglais des Affaires).
- **Catégorisation** : Organisation par domaines (Bureautique, Langues, etc.).
- **Détails** : Gestion des prix, durées, prérequis et descriptions.

### 2.2. Gestion des Modules
- **Programme** : Découpage des formations en modules pédagogiques.
- **Volume Horaire** : Définition des heures par module.

### 2.3. Gestion des Sessions (Classes)
- **Planification** : Création de sessions avec dates de début/fin.
- **Attribution** : Assignation d'un formateur et d'une salle.
- **Emploi du Temps** : Définition des jours et heures de cours (ex: Lundi 9h-12h).
- **Suivi** : Statut des sessions (Planifiée, En cours, Terminée).

### 2.4. Gestion des Enseignants
- **Base de Données RH** : Fiches complètes des formateurs (Coordonnées, Spécialités).
- **Taux Horaire** : Gestion de la rémunération horaire.
- **Disponibilités** : Suivi des créneaux disponibles.

---

## 3. Module de Scolarité (Secrétariat)

### 3.1. Gestion des Étudiants
- **Dossier Étudiant** : Informations personnelles, contacts d'urgence, historique.
- **Inscription** : Matricule unique généré automatiquement.
- **Suivi de Statut** : Actif, Abandon, Diplômé.

### 3.2. Inscriptions aux Cours
- **Enrôlement** : Inscription d'un étudiant à une session spécifique.
- **Suivi Financier** : Lien direct avec la facturation de la session.

### 3.3. Suivi Académique
- **Présences** : Feuille de présence numérique par session.
- **Notes** : Saisie des notes d'examens et contrôles continus.
- **Bulletins** : Génération de relevés de notes.

### 3.4. Certification
- **Délivrance** : Génération de certificats pour les étudiants ayant validé leur formation.
- **Vérification** : Numéro unique de certificat pour authentification.

---

## 4. Module Financier

### 4.1. Facturation
- **Génération Automatique** : Création de factures basées sur les inscriptions.
- **Suivi des Échéances** : Alertes pour les paiements en retard.

### 4.2. Gestion des Paiements
- **Encaissement** : Enregistrement des paiements (Espèces, Chèque, Mobile Money).
- **Reçus** : Génération de preuves de paiement.
- **Suivi de Solde** : Calcul automatique du "Reste à payer".
- **État Financier** : Statut en temps réel (Payé, Partiel, Impayé).

---

## 5. Module de Communication

### 5.1. Annonces
- **Diffusion** : Publication d'informations importantes sur le tableau de bord.
- **Ciblage** : Annonces générales ou ciblées.

### 5.2. Notifications
- **Alertes Système** : Notifications pour les tâches urgentes (Factures impayées, Stocks bas, etc.).
