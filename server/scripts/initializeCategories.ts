import { connectToDatabase } from "../db/mongodb";

const categories = [
  {
    name: "Buy/Sale",
    slug: "sale",
    icon: "🏠",
    description: "Properties for sale",
    active: true,
    order: 1,
    subcategories: [
      {
        id: "1bhk",
        name: "1 BHK Apartment",
        slug: "1bhk",
        description: "Single bedroom apartments for sale",
      },
      {
        id: "2bhk",
        name: "2 BHK Apartment",
        slug: "2bhk",
        description: "Two bedroom apartments for sale",
      },
      {
        id: "3bhk",
        name: "3 BHK Apartment",
        slug: "3bhk",
        description: "Three bedroom apartments for sale",
      },
      {
        id: "4bhk-plus",
        name: "4+ BHK Apartment",
        slug: "4bhk-plus",
        description: "Four or more bedroom apartments for sale",
      },
      {
        id: "independent-house",
        name: "Independent House",
        slug: "independent-house",
        description: "Independent houses for sale",
      },
      {
        id: "villa",
        name: "Villa",
        slug: "villa",
        description: "Villas for sale",
      },
      {
        id: "duplex",
        name: "Duplex",
        slug: "duplex",
        description: "Duplex properties for sale",
      },
      {
        id: "penthouse",
        name: "Penthouse",
        slug: "penthouse",
        description: "Penthouse apartments for sale",
      },
      {
        id: "residential-plot",
        name: "Residential Plot",
        slug: "residential-plot",
        description: "Residential plots for sale",
      },
      {
        id: "commercial-plot",
        name: "Commercial Plot",
        slug: "commercial-plot",
        description: "Commercial plots for sale",
      },
      {
        id: "shop",
        name: "Shop",
        slug: "shop",
        description: "Commercial shops for sale",
      },
      {
        id: "office",
        name: "Office Space",
        slug: "office",
        description: "Office spaces for sale",
      },
    ],
  },
  {
    name: "Rent",
    slug: "rent",
    icon: "🏠",
    description: "Properties for rent",
    active: true,
    order: 2,
    subcategories: [
      {
        id: "1bhk-rent",
        name: "1 BHK Apartment",
        slug: "1bhk",
        description: "Single bedroom apartments for rent",
      },
      {
        id: "2bhk-rent",
        name: "2 BHK Apartment",
        slug: "2bhk",
        description: "Two bedroom apartments for rent",
      },
      {
        id: "3bhk-rent",
        name: "3 BHK Apartment",
        slug: "3bhk",
        description: "Three bedroom apartments for rent",
      },
      {
        id: "house-rent",
        name: "Independent House",
        slug: "independent-house",
        description: "Independent houses for rent",
      },
      {
        id: "villa-rent",
        name: "Villa",
        slug: "villa",
        description: "Villas for rent",
      },
      {
        id: "shop-rent",
        name: "Shop",
        slug: "shop",
        description: "Commercial shops for rent",
      },
      {
        id: "office-rent",
        name: "Office Space",
        slug: "office",
        description: "Office spaces for rent",
      },
    ],
  },
  {
    name: "PG",
    slug: "pg",
    icon: "🏢",
    description: "Paying Guest accommodations",
    active: true,
    order: 3,
    subcategories: [
      {
        id: "boys-pg",
        name: "Boys PG",
        slug: "boys-pg",
        description: "Paying guest accommodation for boys",
      },
      {
        id: "girls-pg",
        name: "Girls PG",
        slug: "girls-pg",
        description: "Paying guest accommodation for girls",
      },
      {
        id: "co-living",
        name: "Co-living Space",
        slug: "co-living",
        description: "Co-living spaces",
      },
    ],
  },
];

export async function initializeCategories() {
  try {
    console.log("🔄 Initializing categories and subcategories...");
    
    const { db } = await connectToDatabase();
    const categoriesCollection = db.collection("categories");

    // Clear existing categories
    await categoriesCollection.deleteMany({});
    
    // Insert new categories
    await categoriesCollection.insertMany(categories);
    
    console.log("✅ Categories and subcategories initialized successfully");
    console.log(`📊 Inserted ${categories.length} categories`);
    
    // Show subcategory counts
    categories.forEach(cat => {
      console.log(`  - ${cat.name}: ${cat.subcategories.length} subcategories`);
    });
    
  } catch (error) {
    console.error("❌ Error initializing categories:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  initializeCategories()
    .then(() => {
      console.log("✅ Categories initialization complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Categories initialization failed:", error);
      process.exit(1);
    });
}
