const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config({ path: '.env' });

const categoriesConfig = {
  Clothing: ['Mens', 'Womens', 'Oversized', 'Anime', 'Graphic', 'Plain', 'Trending']
};

const images = {
  Mens: ["https://images.unsplash.com/photo-1488161628813-04466f872be2", "https://images.unsplash.com/photo-1521572267360-ee0c2909d518"],
  Womens: ["https://images.unsplash.com/photo-1554568218-0f1715e72254", "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f"],
  Oversized: ["https://images.unsplash.com/photo-1562157873-818bc0726f68", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a"],
  Anime: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633", "https://images.unsplash.com/photo-1614608682850-e0ad6ed30a9c"],
  Graphic: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27", "https://images.unsplash.com/photo-1503341503653-ff47dca9193d"],
  Plain: ["https://images.unsplash.com/photo-1523381210434-271e8be1f52b", "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d"],
  Trending: ["https://images.unsplash.com/photo-1558769132-cb1aea458c5e", "https://images.unsplash.com/photo-1490481651871-ab68de25d43d"]
};

const adjectives = ['Luxe', 'Velocity', 'Hyper', 'Cloud-Walk', 'Retro', 'Futura', 'Ghost', 'Stellar', 'Primal', 'Nomad', 'Apex', 'Core', 'Nitro'];
const clothingNouns = ['Boxy Tee', 'Heavyweight Tee', 'Relic Top', 'Drop Shoulder', 'Graphic Tee', 'Statement Tee', 'Essential Tee', 'Vibe Top', 'Street Jersey'];

const generateProducts = () => {
  const products = [];
  
  Object.keys(categoriesConfig).forEach(mainCat => {
    categoriesConfig[mainCat].forEach(subCat => {
      for (let i = 1; i <= 30; i++) {
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = clothingNouns[Math.floor(Math.random() * clothingNouns.length)];

        const variantImages = images[subCat] || images['Mens'];
        const img = variantImages[Math.floor(Math.random() * variantImages.length)];

        let genderVal = 'unisex';
        if (subCat === 'Womens') genderVal = 'women';
        else if (subCat === 'Mens') genderVal = 'men';

        products.push({
          name: `${adj} ${noun} #${i}`,
          description: `The all-new ${subCat} ${noun.toLowerCase()} from our ${mainCat} collection. Engineered for maximum ${adj.toLowerCase()} vibes.`,
          price: Math.floor(Math.random() * (7999 - 999 + 1)) + 999,
          images: [{
            url: `${img}?auto=format&fit=crop&q=80&w=800&sig=${mainCat}${subCat}${i}`,
            public_id: `seed_${mainCat}_${subCat}_${i}`
          }],
          category: mainCat,
          subCategory: subCat,
          gender: genderVal,
          sizes: ['S', 'M', 'L', 'XL', 'XXL'],
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
    console.log('MongoDB connected for seeding');
    
    await Product.deleteMany({});
    console.log('Old inventory purged');
    
    const products = generateProducts();
    await Product.insertMany(products);
    console.log(`Successfully seeded ${products.length} clothing products!`);
    
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
