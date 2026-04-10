-- Créer la table mnemos avec toutes les colonnes nécessaires
-- Exécuter cette commande dans votre interface Supabase SQL Editor

-- Supprimer la table si elle existe déjà
DROP TABLE IF EXISTS mnemos;

-- Créer la table mnemos
CREATE TABLE mnemos (
  id SERIAL PRIMARY KEY,
  id_client TEXT NOT NULL,
  civility TEXT,
  last_name TEXT,
  first_name TEXT,
  address TEXT,
  complement TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT,
  phone_1 TEXT,
  phone_2 TEXT,
  email TEXT,
  partner TEXT,
  prestashop_p1 TEXT,
  prestashop_p2 TEXT,
  secondary_contact JSONB,
  children JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer un index sur id_client pour les performances
CREATE INDEX idx_mnemos_id_client ON mnemos(id_client);

-- Désactiver RLS temporairement pour les tests
ALTER TABLE mnemos DISABLE ROW LEVEL SECURITY;

-- Vérifier la structure de la table
\d mnemos;

-- Test d'insertion
INSERT INTO mnemos (
  id_client,
  civility,
  last_name,
  first_name,
  address,
  postal_code,
  city,
  country,
  phone_1,
  email,
  secondary_contact,
  children
) VALUES (
  'TEST001',
  'M et Mme',
  'DUPONT',
  'Jean et Marie',
  '123 Rue de la Paix',
  '75001',
  'Paris',
  'France',
  '01 23 45 67 89',
  'dupont@example.com',
  '{"lastName": "DUPONT", "firstName": "Pierre", "role": "Grand-père", "phone": "01 98 76 54 32", "email": "pierre.dupont@example.com"}',
  '[{"id": "child1", "lastName": "DUPONT", "firstName": "Lucas", "birthDate": "2015-03-15", "gender": "M", "health": {"allergies": "Aucune", "diet": "Normal", "healthIssues": "Aucun", "instructions": "Aucune", "friend": "", "vacaf": "", "transportNotes": ""}}]'
);

-- Vérifier l'insertion
SELECT * FROM mnemos WHERE id_client = 'TEST001';

-- Nettoyer le test
DELETE FROM mnemos WHERE id_client = 'TEST001';
