const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const products = [
  {
    name: 'Smartphone X',
    description: 'Latest smartphone with advanced features',
    price: 699.99,
    category: 'Electronics',
    imageUrl: 'https://via.placeholder.com/300',
    stock: 50,
    features: ['6.5" Display', '128GB Storage', '5G Capable']
  },
  {
    name: 'Laptop Pro',
    description: 'High-performance laptop for professionals',
    price: 1299.99,
    category: 'Electronics',
    imageUrl: 'https://via.placeholder.com/300',
    stock: 30,
    features: ['15" Display', '16GB RAM', '512GB SSD']
  },
  {
    name: 'Wireless Headphones',
    description: 'Noise-cancelling wireless headphones',
    price: 199.99,
    category: 'Electronics',
    imageUrl: 'https://via.placeholder.com/300',
    stock: 100,
    features: ['Active Noise Cancellation', '30h Battery Life', 'Bluetooth 5.0']
  },
  {
    name: 'Smart Watch',
    description: 'Fitness and health tracking smartwatch',
    price: 249.99,
    category: 'Electronics',
    imageUrl: 'https://via.placeholder.com/300',
    stock: 75,
    features: ['Heart Rate Monitor', 'GPS', 'Water Resistant']
  },
  {
    name: 'Gaming Console',
    description: 'Next-gen gaming console',
    price: 499.99,
    category: 'Electronics',
    imageUrl: 'https://via.placeholder.com/300',
    stock: 25,
    features: ['4K Gaming', '1TB Storage', 'Backward Compatible']
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-chatbot');
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    await Product.insertMany(products);
    console.log('Seeded database with products');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 