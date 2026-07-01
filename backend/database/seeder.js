require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Message = require('../models/Message');

const seedUsers = [
  {
    name: 'SK Cakes Admin',
    email: 'admin@skcakes.com',
    password: 'password123', // Will be hashed via pre-save hooks
    role: 'admin'
  }
];

const seedProducts = [
  {
    name: 'Classic Birthday Chocolate Cake',
    description: 'Delectable double chocolate sponge cake covered with premium Belgian chocolate frosting and customized edible greetings.',
    price: 35000, // UGX or regional currency equivalent
    category: 'cakes',
    subCategory: 'Birthday',
    stock: 15,
    isFeatured: true,
    imageUrl: '/images/products/placeholder-chocolate-cake.png'
  },
  {
    name: 'Multi-tier Royal Wedding Cake',
    description: 'Elegant vanilla and almond tier cake styled with handmade sugar paste flowers and premium white chocolate ganache.',
    price: 450000,
    category: 'cakes',
    subCategory: 'Wedding',
    stock: 5,
    isFeatured: true,
    imageUrl: '/images/products/placeholder-wedding-cake.png'
  },
  {
    name: 'Graduation Cupcake Box (Set of 12)',
    description: 'Fresh baked chocolate and velvet cupcakes detailed with adorable miniature mortarboard hats made of chocolate.',
    price: 40000,
    category: 'cakes',
    subCategory: 'Cupcakes',
    stock: 25,
    isFeatured: false,
    imageUrl: '/images/products/placeholder-cupcakes.png'
  },
  {
    name: 'Crispy Fried Chicken Snacks (3 Pcs)',
    description: 'Juicy, tender chicken thighs marinated in Kampala style spices, breaded and pressure fried to golden crispiness.',
    price: 15000,
    category: 'snacks',
    subCategory: 'Chicken snacks',
    stock: 50,
    isFeatured: true,
    imageUrl: '/images/products/placeholder-chicken.png'
  },
  {
    name: 'Traditional Beef Samosas (Plate of 4)',
    description: 'Crispy flaky triangular pastry shells stuffed with seasoned minced beef, green onions, and hot Ugandan green chillies.',
    price: 8000,
    category: 'snacks',
    subCategory: 'Samosas',
    stock: 100,
    isFeatured: true,
    imageUrl: '/images/products/placeholder-samosas.png'
  },
  {
    name: 'Spiced Potato Fries (Chips)',
    description: 'Fresh cut hand-peeled Irish potatoes fried and seasoned with fine sea salt, paprika, and a touch of local herbs.',
    price: 6000,
    category: 'chips',
    subCategory: 'French Fries',
    stock: 80,
    isFeatured: false,
    imageUrl: '/images/products/placeholder-chips.png'
  },
  {
    name: 'Gourmet Smoked Sausages',
    description: 'Sausage links lightly seasoned, hot smoked, and served with custom mustard dipping sauces.',
    price: 5000,
    category: 'snacks',
    subCategory: 'Sausages',
    stock: 120,
    isFeatured: false,
    imageUrl: '/images/products/placeholder-sausages.png'
  },
  {
    name: 'Glazed Yeast Doughnuts (Pack of 6)',
    description: 'Soft, airy, yeast-raised dough rings dressed with high-gloss sugar glaze or rich chocolate sprinkles.',
    price: 12000,
    category: 'snacks',
    subCategory: 'Doughnuts',
    stock: 30,
    isFeatured: false,
    imageUrl: '/images/products/placeholder-doughnuts.png'
  },
  {
    name: 'Traditional Ugandan Mandazi',
    description: 'Fluffy, lightly sweetened, cardamom-infused fried bread. The perfect accompaniment to afternoon tea or coffee.',
    price: 1500,
    category: 'snacks',
    subCategory: 'Mandazi',
    stock: 200,
    isFeatured: true,
    imageUrl: '/images/products/placeholder-mandazi.png'
  },
  {
    name: 'Choc-Chip Butter Cookies (Box of 20)',
    description: 'Rich, crumbly butter cookies loaded with dark and milk chocolate morsels. Baked fresh daily.',
    price: 18000,
    category: 'cookies',
    subCategory: 'Cookies',
    stock: 45,
    isFeatured: false,
    imageUrl: '/images/products/placeholder-cookies.png'
  },
  {
    name: 'Passion Fruit Juice (1 Litre Bottle)',
    description: 'Naturally sweetened juice made of cold-pressed passion fruits grown in regional organic farms.',
    price: 10000,
    category: 'drinks',
    subCategory: 'Drinks',
    stock: 60,
    isFeatured: true,
    imageUrl: '/images/products/placeholder-passion.png'
  }
];

const seedDB = async () => {
  try {
    const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/sk_cakes';
    console.log(`Connecting to database to seed: ${dbUrl}...`);
    await mongoose.connect(dbUrl);

    // Clear existing data
    console.log('Clearing old collections...');
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Message.deleteMany();

    // Seed users
    console.log('Seeding administrative users...');
    await User.create(seedUsers);

    // Seed products
    console.log('Seeding SK Cakes initial product catalog...');
    await Product.create(seedProducts);

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    process.exit(1);
  }
};

seedDB();
