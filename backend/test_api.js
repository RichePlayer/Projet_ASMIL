const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAPI() {
    try {
        console.log('=== Test de l\'API ===\n');

        // Test 1: Formations
        console.log('1. Test GET /formations');
        const formationsResponse = await axios.get(`${API_URL}/formations`);
        console.log(`   ✓ Formations récupérées: ${formationsResponse.data.formations?.length || 0}`);
        console.log(`   Pagination: page ${formationsResponse.data.pagination?.page}, limit ${formationsResponse.data.pagination?.limit}`);
        console.log(`   Total dans la BD: ${formationsResponse.data.pagination?.total}\n`);

        // Test 2: Formations avec limit
        console.log('2. Test GET /formations?limit=1000');
        const formationsAllResponse = await axios.get(`${API_URL}/formations?limit=1000`);
        console.log(`   ✓ Formations récupérées: ${formationsAllResponse.data.formations?.length || 0}`);
        console.log(`   Total dans la BD: ${formationsAllResponse.data.pagination?.total}\n`);

        // Test 3: Teachers
        console.log('3. Test GET /teachers');
        const teachersResponse = await axios.get(`${API_URL}/teachers`);
        console.log(`   ✓ Enseignants récupérés: ${teachersResponse.data.teachers?.length || 0}`);
        console.log(`   Total dans la BD: ${teachersResponse.data.pagination?.total}\n`);

        // Test 4: Modules
        console.log('4. Test GET /modules');
        const modulesResponse = await axios.get(`${API_URL}/modules`);
        console.log(`   ✓ Modules récupérés: ${modulesResponse.data?.length || 0}\n`);

        console.log('=== Résumé ===');
        console.log(`Formations dans la BD: ${formationsAllResponse.data.pagination?.total || 0}`);
        console.log(`Enseignants dans la BD: ${teachersResponse.data.pagination?.total || 0}`);
        console.log(`Modules dans la BD: ${modulesResponse.data?.length || 0}`);

    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        if (error.response) {
            console.error('   Détails:', error.response.data);
        }
    }
}

testAPI();
