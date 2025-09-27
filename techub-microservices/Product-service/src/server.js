const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/products', (req, res) => {
  const products = [
    {
      id: 1,
      name: "AMD Ryzen 9 5950X",
      price: 699.99,
      description: "16 núcleos, 32 hilos, 4.9 GHz Max Boost. Ideal para gaming y creación de contenido.",
      image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
      category: "procesadores"
    },
    {
      id: 2,
      name: "AMD Ryzen 7 5800X",
      price: 399.99,
      description: "8 núcleos, 16 hilos, 4.7 GHz Max Boost. Rendimiento excepcional en juegos.",
      image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
      category: "procesadores"
    },
    {
      id: 3,
      name: "AMD Ryzen 5 5600X",
      price: 249.99,
      description: "6 núcleos, 12 hilos, 4.6 GHz Max Boost. Gran relación calidad-precio.",
      image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80",
      category: "procesadores"
    },
    {
      id: 4,
      name: "Intel Core i9-13900K",
      price: 589.99,
      description: "24 núcleos (8P + 16E), 32 hilos, hasta 5.8 GHz. Potencia bruta para productividad.",
      image: "https://images.unsplash.com/photo-1628348078812-27418273108f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
      category: "procesadores"
    }
  ];

  res.json(products);
});

app.listen(PORT, () => {
  console.log(`product-service corriendo en http://localhost:${PORT}`);
});