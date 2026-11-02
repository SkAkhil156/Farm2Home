
import "dotenv/config";
import mongoose from "mongoose";
import Product from "./src/models/Product.js";
import User from "./src/models/User.js";

const demoProducts = [
    // Grains
    ["Basmati Rice", "grains", "Rice", 90, "kg"],
    ["Sona Masoori Rice", "grains", "Rice", 65, "kg"],
    ["Brown Rice", "grains", "Rice", 85, "kg"],
    ["Organic Wheat", "grains", "Wheat", 42, "kg"],
    ["Whole Wheat", "grains", "Wheat", 38, "kg"],
    ["Pearl Millet (Bajra)", "grains", "Millet", 45, "kg"],
    ["Finger Millet (Ragi)", "grains", "Millet", 50, "kg"],
    ["Foxtail Millet", "grains", "Millet", 95, "kg"],
    ["Sorghum (Jowar)", "grains", "Millet", 48, "kg"],
    ["Maize", "grains", "Corn", 32, "kg"],

    // Pulses
    ["Toor Dal", "pulses", "Pigeon Pea", 150, "kg"],
    ["Green Gram", "pulses", "Moong", 120, "kg"],
    ["Black Gram", "pulses", "Urad", 110, "kg"],
    ["Chickpeas", "pulses", "Chickpeas", 90, "kg"],
    ["Red Lentils", "pulses", "Lentils", 100, "kg"],
    ["Horse Gram", "pulses", "Horse Gram", 85, "kg"],
    ["Cowpeas", "pulses", "Cowpea", 95, "kg"],
    ["Kabuli Chana", "pulses", "Chickpeas", 115, "kg"],

    // Vegetables
    ["Fresh Potatoes", "vegetables", "Root Vegetables", 30, "kg"],
    ["Red Onions", "vegetables", "Bulbs", 35, "kg"],
    ["Fresh Carrots", "vegetables", "Root Vegetables", 45, "kg"],
    ["Green Chillies", "vegetables", "Chillies", 50, "kg"],
    ["Fresh Brinjal", "vegetables", "Eggplant", 35, "kg"],
    ["Cauliflower", "vegetables", "Vegetables", 40, "piece"],
    ["Fresh Cabbage", "vegetables", "Vegetables", 30, "piece"],
    ["Spinach", "vegetables", "Leafy Vegetables", 25, "bunch"],
    ["Drumsticks", "vegetables", "Vegetables", 60, "kg"],
    ["Okra (Ladies Finger)", "vegetables", "Vegetables", 45, "kg"],
    ["Bottle Gourd", "vegetables", "Vegetables", 35, "piece"],
    ["Cucumber", "vegetables", "Vegetables", 30, "kg"],
    ["Fresh Pumpkin", "vegetables", "Vegetables", 35, "kg"],
    ["Green Peas", "vegetables", "Vegetables", 70, "kg"],

    // Fruits
    ["Fresh Bananas", "fruits", "Banana", 50, "dozen"],
    ["Sweet Oranges", "fruits", "Citrus", 70, "kg"],
    ["Red Apples", "fruits", "Apple", 160, "kg"],
    ["Papaya", "fruits", "Papaya", 40, "kg"],
    ["Fresh Guava", "fruits", "Guava", 55, "kg"],
    ["Watermelon", "fruits", "Melons", 30, "kg"],
    ["Pomegranate", "fruits", "Pomegranate", 140, "kg"],
    ["Sweet Grapes", "fruits", "Grapes", 90, "kg"],
    ["Pineapple", "fruits", "Tropical Fruits", 55, "piece"],
    ["Fresh Lemon", "fruits", "Citrus", 60, "kg"],
    ["Seasonal Sapota", "fruits", "Sapota", 45, "kg"],
    ["Fresh Coconut", "fruits", "Coconut", 35, "piece"],

    // Spices
    ["Turmeric Powder", "spices", "Turmeric", 180, "kg"],
    ["Red Chilli Powder", "spices", "Chilli", 220, "kg"],
    ["Coriander Seeds", "spices", "Coriander", 130, "kg"],
    ["Cumin Seeds", "spices", "Cumin", 350, "kg"],
    ["Black Pepper", "spices", "Pepper", 600, "kg"],
    ["Mustard Seeds", "spices", "Mustard", 100, "kg"],
    ["Fenugreek Seeds", "spices", "Fenugreek", 120, "kg"],
    ["Cardamom", "spices", "Cardamom", 1500, "kg"],

    // Seeds
    ["Tomato Seeds Pack", "seeds", "Vegetable Seeds", 80, "pack"],
    ["Chilli Seeds Pack", "seeds", "Vegetable Seeds", 75, "pack"],
    ["Okra Seeds Pack", "seeds", "Vegetable Seeds", 65, "pack"],
    ["Sunflower Seeds", "seeds", "Oil Seeds", 120, "kg"],
    ["Sesame Seeds", "seeds", "Oil Seeds", 180, "kg"],
    ["Groundnut Seeds", "seeds", "Oil Seeds", 100, "kg"],
    ["Hybrid Maize Seeds", "seeds", "Crop Seeds", 250, "pack"],
    ["Millet Seeds", "seeds", "Crop Seeds", 90, "kg"],

    // Nuts and dry fruits
    ["Raw Groundnuts", "nuts_dry_fruits", "Groundnuts", 100, "kg"],
    ["Cashews", "nuts_dry_fruits", "Cashews", 800, "kg"],
    ["Almonds", "nuts_dry_fruits", "Almonds", 900, "kg"],
    ["Raisins", "nuts_dry_fruits", "Raisins", 350, "kg"],
    ["Walnuts", "nuts_dry_fruits", "Walnuts", 1000, "kg"],

    // Dairy
    ["Fresh Cow Milk", "dairy", "Milk", 60, "litre"],
    ["Fresh Curd", "dairy", "Curd", 70, "kg"],
    ["Farm Butter", "dairy", "Butter", 450, "kg"],
    ["Fresh Paneer", "dairy", "Paneer", 350, "kg"],

    // Honey and oil
    ["Raw Honey", "honey", "Honey", 300, "kg"],
    ["Cold Pressed Groundnut Oil", "oil_products", "Groundnut Oil", 220, "litre"],
    ["Sesame Oil", "oil_products", "Sesame Oil", 280, "litre"],
    ["Coconut Oil", "oil_products", "Coconut Oil", 250, "litre"],

    // Organic products
    ["Organic Turmeric", "organic_products", "Organic Spices", 250, "kg"],
    ["Organic Millet Mix", "organic_products", "Organic Grains", 130, "kg"],
    ["Organic Pulses Mix", "organic_products", "Organic Pulses", 160, "kg"],

    // Fertilizers and manure
    ["Organic Compost", "manure", "Compost", 120, "bag"],
    ["Vermicompost", "manure", "Vermicompost", 180, "bag"],
    ["Farmyard Manure", "manure", "Farmyard Manure", 100, "bag"],
    ["Neem Cake", "fertilizers", "Organic Fertilizer", 250, "bag"],
    ["Seaweed Fertilizer", "fertilizers", "Plant Fertilizer", 200, "litre"],

    // Farming tools
    ["Garden Hand Trowel", "farming_tools", "Hand Tools", 180, "piece"],
    ["Pruning Shears", "farming_tools", "Cutting Tools", 350, "piece"],
    ["Garden Hoe", "farming_tools", "Hand Tools", 300, "piece"],
    ["Watering Can", "farming_tools", "Garden Tools", 250, "piece"],
    ["Seedling Tray", "farming_tools", "Planting Tools", 120, "piece"],

    // Irrigation
    ["Drip Irrigation Pipe", "irrigation", "Drip Irrigation", 25, "piece"],
    ["Sprinkler Head", "irrigation", "Sprinklers", 150, "piece"],
    ["Garden Water Connector", "irrigation", "Connectors", 60, "piece"],

    // Animal feed
    ["Cattle Feed", "animal_feed", "Livestock Feed", 800, "bag"],
    ["Poultry Feed", "animal_feed", "Poultry Feed", 650, "bag"],
    ["Dry Fodder", "animal_feed", "Fodder", 250, "bag"],

    // Other farm products
    ["Fresh Sugarcane", "other", "Sugarcane", 20, "piece"],
    ["Raw Cotton", "other", "Cotton", 90, "kg"],
    ["Jute Fibre", "other", "Natural Fibre", 75, "kg"],
    ["Fresh Curry Leaves", "other", "Herbs", 20, "bunch"],
    ["Fresh Mint", "other", "Herbs", 20, "bunch"],
];

async function seedProducts() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing from backend/.env");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        const farmer = await User.findOne({ role: "farmer" }).sort({
            createdAt: 1,
        });

        if (!farmer) {
            throw new Error(
                "No farmer account found. Register a farmer before running this script."
            );
        }

        let added = 0;
        let skipped = 0;

        for (const [name, category, subcategory, price, unit] of demoProducts) {
            const exists = await Product.exists({
                name,
                farmer: farmer._id,
            });

            if (exists) {
                skipped++;
                continue;
            }

            await Product.create({
                name,
                category,
                subcategory,
                description: `Demo catalogue listing for ${name}. Confirm actual availability, quality, and price with the seller before purchase.`,
                price,
                unit,
                quantity: 20,
                imageUrl: "",
                isOrganic: false,
                condition: "fresh",
                location: "",
                tags: [subcategory, category],
                farmer: farmer._id,
                isActive: true,
            });

            added++;
        }

        console.log(`Added ${added} sample products.`);
        console.log(`Skipped ${skipped} existing products.`);
        console.log("These are demo listings, not verified offers.");
    } catch (error) {
        console.error("Seeding failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seedProducts();
