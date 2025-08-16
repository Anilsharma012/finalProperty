import { connectToDatabase } from './server/db/mongodb.js';

async function checkProperties() {
  try {
    const { db } = await connectToDatabase();
    
    console.log('📊 Checking Properties...');
    
    const total = await db.collection('properties').countDocuments();
    console.log('Total properties:', total);
    
    const approved = await db.collection('properties').countDocuments({
      status: 'active',
      approvalStatus: 'approved'
    });
    console.log('Approved & Active properties:', approved);
    
    if (approved > 0) {
      console.log('\n📋 Sample approved properties:');
      const samples = await db.collection('properties').find({
        status: 'active',
        approvalStatus: 'approved'
      }, {
        projection: { 
          title: 1, 
          priceType: 1, 
          propertyType: 1, 
          subCategory: 1 
        }
      }).limit(5).toArray();
      
      samples.forEach((prop, i) => {
        console.log(`${i+1}. ${prop.title}`);
        console.log(`   priceType: ${prop.priceType}`);
        console.log(`   propertyType: ${prop.propertyType}`);
        console.log(`   subCategory: ${prop.subCategory}`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProperties();
