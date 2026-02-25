const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config({ path: '.env' });

const categoriesConfig = {
  Clothing: ['Mens', 'Womens', 'Oversized', 'Anime', 'Graphic', 'Plain', 'Trending'],
  'Mobile Accessories': ['Phone Covers', 'Skins', 'AirPods Covers'],
  Gifts: ['Combo Packs', 'Gift Cards', 'Couple Gifts', 'Customized Gifts'],
  Footwear: ['Sneakers', 'Slides', 'Boots']
};

const images = {
  Mens: ["https://images.unsplash.com/photo-1488161628813-04466f872be2", "https://images.unsplash.com/photo-1521572267360-ee0c2909d518"],
  Womens: ["https://images.unsplash.com/photo-1554568218-0f1715e72254", "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f"],
  Oversized: ["https://images.unsplash.com/photo-1562157873-818bc0726f68", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a"],
  Anime: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633", "https://images.unsplash.com/photo-1614608682850-e0ad6ed30a9c"],
  Graphic: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27", "https://images.unsplash.com/photo-1503341503653-ff47dca9193d"],
  Plain: ["https://images.unsplash.com/photo-1523381210434-271e8be1f52b", "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d"],
  Trending: ["https://images.unsplash.com/photo-1558769132-cb1aea458c5e", "https://images.unsplash.com/photo-1490481651871-ab68de25d43d"],
  'Phone Covers': ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef", "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3"],
  Skins: ["https://images.unsplash.com/photo-1605405748313-a416a1b84491", "https://images.unsplash.com/photo-1586953140530-bc5633854714"],
  'AirPods Covers': ["https://images.unsplash.com/photo-1592921847399-6a0e5c3e56c1", "https://images.unsplash.com/photo-1588423713661-8600173051c0"],
  'Combo Packs': ["https://images.unsplash.com/photo-1549465220-1d8c9d9c67cf", "https://images.unsplash.com/photo-147119394590b-354a7c18c161"],
  'Gift Cards': ["https://images.unsplash.com/photo-1559136555-9303baea8ebd", "https://images.unsplash.com/photo-1549111239-498c86be45f8"],
  'Couple Gifts': ["https://images.unsplash.com/photo-1513201099691-8816d338fcdc", "https://images.unsplash.com/photo-1512909481869-0eaa1e9817ba"],
  'Customized Gifts': ["https://images.unsplash.com/photo-1523275335684-37898b6baf30", "https://images.unsplash.com/photo-1533228100845-08145b01de14"],
  'Sneakers': ["https://images.unsplash.com/photo-1542291026-7eec264c274f", "https://images.unsplash.com/photo-1549298916-b41d501d3772"],
  'Slides': ["https://images.unsplash.com/photo-1627140224151-24422e0302b1", "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519"],
  'Boots': ["https://images.unsplash.com/photo-1520639889313-7272170b1ca0", "https://images.unsplash.com/photo-1608256246200-53e635b5b65f"]
};

const adjectives = ['Luxe', 'Velocity', 'Hyper', 'Cloud-Walk', 'Retro', 'Futura', 'Ghost', 'Stellar', 'Primal', 'Nomad', 'Apex', 'Core', 'Nitro'];
const clothingNouns = ['Boxy Tee', 'Heavyweight Tee', 'Relic Top', 'Drop Shoulder', 'Graphic Tee', 'Statement Tee', 'Essential Tee', 'Vibe Top', 'Street Jersey'];
const accessoryNouns = ['Carbon Case', 'Silicone Skin', 'Impact Cover', 'Stealth Guard', 'Hard Shell'];
const giftNouns = ['Luxe Bundle', 'Digital Pass', 'Memory Box', 'Artisan Kit', 'Crafted Box'];
const footwearNouns = ['Runner x1', 'Street Kick', 'Impact Slide', 'Terrain Boot', 'Vibe Step', 'Urban Sole'];

const generateProducts = () => {
  const products = [];
  
  Object.keys(categoriesConfig).forEach(mainCat => {
    categoriesConfig[mainCat].forEach(subCat => {
      for (let i = 1; i <= 30; i++) {
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        let noun;
        if (mainCat === 'Clothing') noun = clothingNouns[Math.floor(Math.random() * clothingNouns.length)];
        else if (mainCat === 'Mobile Accessories') noun = accessoryNouns[Math.floor(Math.random() * accessoryNouns.length)];
        else if (mainCat === 'Footwear') noun = footwearNouns[Math.floor(Math.random() * footwearNouns.length)];
        else noun = giftNouns[Math.floor(Math.random() * giftNouns.length)];

        const variantImages = images[subCat] || images['Mens'];
        const img = variantImages[Math.floor(Math.random() * variantImages.length)];

        products.push({
          name: `${adj} ${noun} #${i}`,
          description: `The all-new ${subCat} ${noun.toLowerCase()} from our ${mainCat} collection. Engineered for maximum ${adj.toLowerCase()} vibes.`,
          price: Math.floor(Math.random() * (7999 - 999 + 1)) + 999,
          image: `${img}?auto=format&fit=crop&q=80&w=800&sig=${mainCat}${subCat}${i}`,
          mainCategory: mainCat,
          subCategory: subCat,
          stock: Math.floor(Math.random() * 50) + 5,
          isFeatured: i <= 2
        });
      }
    });
  });

  return products;
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for Footwear upgrade');
    
    await Product.deleteMany({});
    console.log('Old inventory purged');
    
    const products = generateProducts();
    await Product.insertMany(products);
    console.log(`Successfully seeded ${products.length} products with Footwear!`);
    
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
