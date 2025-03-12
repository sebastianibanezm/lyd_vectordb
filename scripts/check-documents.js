require('dotenv').config({path: '.env.local'});
const { db } = require('../db');
const { documentsTable } = require('../db/schema/documents-schema');

async function checkDocs() {
  try {
    const docs = await db.select({
      metadata: documentsTable.metadata
    }).from(documentsTable).limit(3);
    
    console.log('Sample document metadata:');
    docs.forEach((doc, i) => {
      console.log(`Doc ${i + 1}:`, JSON.stringify(doc.metadata, null, 2));
    });
  } catch (e) {
    console.error('Error:', e);
  }
}

checkDocs(); 