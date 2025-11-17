// Script de test pour vérifier l'intégration Supabase
/* eslint-disable @typescript-eslint/no-require-imports */
// Exécuter avec: node test-supabase-integration.js

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseAnonKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseIntegration() {
  console.log('🧪 Test d\'intégration Supabase...\n');

  const testFamily = {
    id_client: 'TEST_' + Date.now(),
    civility: 'M et Mme',
    last_name: 'TEST',
    first_name: 'Famille Test',
    address: '123 Rue Test',
    complement: 'Appartement Test',
    postal_code: '75001',
    city: 'Paris',
    country: 'France',
    phone_1: '01 23 45 67 89',
    phone_2: '06 12 34 56 78',
    email: 'test@example.com',
    partner: 'Partenaire Test',
    prestashop_p1: 'PS001',
    prestashop_p2: 'PS002',
    secondary_contact: {
      lastName: 'TEST',
      firstName: 'Contact Test',
      role: 'Responsable',
      phone: '01 98 76 54 32',
      email: 'contact.test@example.com'
    },
    children: [{
      id: 'child_test_1',
      lastName: 'TEST',
      firstName: 'Enfant Test',
      birthDate: '2015-03-15',
      gender: 'M',
      health: {
        allergies: 'Aucune',
        diet: 'Normal',
        healthIssues: 'Aucun',
        instructions: 'Aucune',
        friend: '',
        vacaf: '',
        transportNotes: ''
      }
    }],
    updated_at: new Date().toISOString()
  };

  try {
    // 1. Test d'insertion
    console.log('1️⃣ Test d\'insertion...');
    const { data: insertedFamily, error: insertError } = await supabase
      .from('clients')
      .insert(testFamily)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erreur d\'insertion:', insertError);
      return;
    }

    console.log('✅ Insertion réussie:', {
      id: insertedFamily.id,
      id_client: insertedFamily.id_client,
      last_name: insertedFamily.last_name
    });

    // 2. Test de lecture
    console.log('\n2️⃣ Test de lecture...');
    const { data: families, error: readError } = await supabase
      .from('clients')
      .select('*')
      .order('id_client', { ascending: true });

    if (readError) {
      console.error('❌ Erreur de lecture:', readError);
      return;
    }

    console.log(`✅ Lecture réussie: ${families.length} familles trouvées`);

    // 3. Test de mise à jour
    console.log('\n3️⃣ Test de mise à jour...');
    const { data: updatedFamily, error: updateError } = await supabase
      .from('clients')
      .update({
        last_name: 'TEST-UPDATED',
        phone_1: '01 23 45 67 90',
        updated_at: new Date().toISOString()
      })
      .eq('id_client', testFamily.id_client)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erreur de mise à jour:', updateError);
      return;
    }

    console.log('✅ Mise à jour réussie:', {
      id_client: updatedFamily.id_client,
      last_name: updatedFamily.last_name,
      phone_1: updatedFamily.phone_1
    });

    // 4. Test de suppression
    console.log('\n4️⃣ Test de suppression...');
    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id_client', testFamily.id_client);

    if (deleteError) {
      console.error('❌ Erreur de suppression:', deleteError);
      return;
    }

    console.log('✅ Suppression réussie');

    // 5. Vérification finale
    console.log('\n5️⃣ Vérification finale...');
    const { data: finalCheck, error: finalError } = await supabase
      .from('clients')
      .select('id_client')
      .eq('id_client', testFamily.id_client);

    if (finalError) {
      console.error('❌ Erreur de vérification:', finalError);
      return;
    }

    if (finalCheck.length === 0) {
      console.log('✅ Vérification réussie: la famille a bien été supprimée');
    } else {
      console.log('❌ Problème: la famille existe encore après suppression');
    }

    console.log('\n🎉 Tous les tests d\'intégration sont passés avec succès!');
    console.log('\n📋 Prochaines étapes:');
    console.log('1. Exécuter le script SQL de création de la table clients dans Supabase');
    console.log('2. Configurer les variables d\'environnement dans .env.local');
    console.log('3. Tester le formulaire sur http://localhost:3000/clients');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter les tests
testSupabaseIntegration();
