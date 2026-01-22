const { db } = require('./src/config/firebase');

async function test() {
    console.log('--- STARTING FIRESTORE DIAGNOSTIC ---');
    try {
        // 1. Write
        const testData = {
            title: 'Diagnostic Report ' + Date.now(),
            description: 'Created by diagnose script at ' + new Date().toISOString(),
            status: 'diagnostic',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        console.log('1. Attempting to write document to "reports" collection...');
        const docRef = await db.collection('reports').add(testData);
        console.log('   ✅ Write successful! Document ID:', docRef.id);

        // 2. Read Specific
        console.log('2. Attempting to read back the specific document...');
        const doc = await db.collection('reports').doc(docRef.id).get();
        if (doc.exists) {
            console.log('   ✅ Read back successful! Data:', doc.data());
        } else {
            console.error('   ❌ FAILED to read back the document immediately!');
        }

        // 3. Read Collection (getAll logic)
        console.log('3. Attempting to read entire "reports" collection (limit 50)...');
        const snapshot = await db.collection('reports').limit(50).get();
        console.log('   ℹ️ Snapshot size:', snapshot.size);

        if (snapshot.empty) {
            console.warn('   ⚠️ Collection appears empty (or query matched nothing).');
        } else {
            console.log('   ✅ Found documents:');
            snapshot.forEach(d => {
                console.log(`      - [${d.id}] ${d.data().title} (${d.data().status})`);
            });
        }

    } catch (error) {
        console.error('❌ DIAGNOSTIC CRITICAL ERROR:', error);
    }

    console.log('--- DIAGNOSTIC COMPLETE ---');
    // Force exit as firebase admin keeps connection open
    process.exit(0);
}

// Give firebase a moment to init
setTimeout(test, 1000);
