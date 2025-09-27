const express = require('express');
const cors = require('cors');
const redis = require('redis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

const redisHost = process.env.REDIS_HOST || 'localhost';
const publisher = redis.createClient({
  host: redisHost,
  port: 6379
});

publisher.on('error', (err) => {
  console.error('Error en Redis Publisher:', err);
});

const products = [
  {
    id: 1,
    name: "AMD Ryzen 9 5900X",
    price: 3510.37,
    description: "16 núcleos, 32 hilos, 4.9 GHz Max Boost. Ideal para gaming y creación de contenido.",
    image: "/img/Productos/amd5900x.jpg",
    category: "procesadores"
  },
  {
    id: 2,
    name: "AMD Ryzen 7 5800X",
    price: 3068.80,
    description: "8 núcleos, 16 hilos, 4.7 GHz Max Boost. Rendimiento excepcional en juegos.",
    image: "/img/Productos/amd5800x.jpg", 
    category: "procesadores"
  },
  {
    id: 3,
    name: "AMD Ryzen 5 5600X",
    price: 1400.00,
    description: "6 núcleos, 12 hilos, 4.6 GHz Max Boost. Gran relación calidad-precio.",
    image: "/img/Productos/amd55600x.jpg", 
    category: "procesadores"
  },
  {
    id: 4,
    name: "Intel Core i9-13900K",
    price: 5404.29,
    description: "24 núcleos (8P + 16E), 32 hilos, hasta 5.8 GHz. Potencia bruta para productividad.",
    image: "/img/Productos/core13900k.jpg",
    category: "procesadores"
  },
  {
    id: 5,
    name: "Intel Core i7-13700K",
    price: 3830.96,
    description: "16 núcleos (8P + 8E), 24 hilos, ideal para gaming y multitarea.",
    image: "/img/Productos/coree13700k.jpg",
    category: "procesadores"
  },
  {
    id: 6,
    name: "Intel Core i5-13600K",
    price: 2953.60,
    description: "14 núcleos (6P + 8E), 20 hilos, excelente opción para builds económicos.",
    image: "/img/Productos/core1360k.jpg",
    category: "procesadores"
  },
  {
    id: 7,
    name: "NVIDIA RTX 4080",
    price: 5823.45,
    description: "Rendimiento ultra para gaming en 4K y ray tracing con DLSS 3.",
    image: "/img/Productos/4080.jpg",
    category: "graficas"
  },
  {
    id: 8,
    name: "NVIDIA RTX 4070 Ti",
    price: 7997.24,
    description: "Alto rendimiento en 1440p con bajo consumo energético.",
    image: "/img/Productos/470.jpg",
    category: "graficas"
  },
  {
    id: 9,
    name: "AMD Radeon RX 7900 XTX",
    price: 6490.65,
    description: "Competidora directa de la RTX 4080, ideal para gaming extremo.",
    image: "/img/Productos/rx1.jpg",
    category: "graficas"
  },
  {
    id: 10,
    name: "NVIDIA RTX 4060",
    price: 4769.56,
    description: "Entrada a la serie 40, perfecta para 1080p y bajo presupuesto.",
    image: "/img/Productos/4060.jpg",
    category: "graficas"
  },
  {
    id: 11,
    name: "AMD Radeon RX 7700 XT",
    price: 5493.76,
    description: "Gran rendimiento en 1440p con soporte para tecnologías AMD.",
    image: "/img/Productos/rx770.jpg",
    category: "graficas"
  },
  {
    id: 12,
    name: "Corsair Vengeance RGB 32GB DDR4 3600MHz",
    price: 2689.96,
    description: "Memoria DDR4 con iluminación RGB y alto rendimiento para gaming.",
    image: "/img/Productos/corsair1.jpg", 
    category: "ram"
  },
  {
    id: 13,
    name: "G.Skill Trident Z5 RGB 32GB DDR5 6000MHz",
    price: 2249.97,
    description: "Memoria DDR5 de última generación para setups de alto rendimiento.",
    image: "/img/Productos/z5.jpg",
    category: "ram"
  },
  {
    id: 14,
    name: "Kingston Fury Beast 16GB DDR4 3200MHz",
    price: 1889.29,
    description: "Memoria confiable y económica, ideal para builds básicos.",
    image: "/img/Productos/king.jpg",
    category: "ram"
  },
  {
    id: 15,
    name: "Samsung 980 Pro 1TB NVMe SSD",
    price: 1929.94,
    description: "SSD NVMe de alto rendimiento para sistema operativo y juegos.",
    image: "/img/Productos/sams.jpg",
    category: "almacenamiento"
  },
  {
    id: 16,
    name: "Western Digital Blue 500GB SATA SSD",
    price: 1259.96,
    description: "SSD económico y confiable para mejorar el rendimiento general.",
    image: "/img/Productos/west.jpg",
    category: "almacenamiento"
  },
  {
    id: 17,
    name: "Crucial P3 2TB NVMe SSD",
    price: 1649.94,
    description: "Gran capacidad y buen rendimiento para almacenamiento primario.",
    image: "/img/Productos/crucial.jpg",
    category: "almacenamiento"
  },
  {
    id: 18,
    name: "Seagate Barracuda 2TB HDD",
    price: 1859.49,
    description: "Disco duro mecánico ideal para almacenar juegos, videos y archivos grandes.",
    image: "/img/Productos/seaga.jpg",
    category: "almacenamiento"
  },
  {
    id: 19,
    name: "Toshiba Canvio Basics 4TB HDD",
    price: 2490.94,
    description: "Gran capacidad para respaldos y almacenamiento externo.",
    image: "/img/Productos/toshiba.jpg",
    category: "almacenamiento"
  },
  {
    id: 20,
    name: "Kingston A2000 1TB NVMe SSD",
    price: 1678.69,
    description: "SSD NVMe económico con buen rendimiento para upgrades.",
    image: "/img/Productos/king1tb.jpg",
    category: "almacenamiento"
  },
  {
    id: 21,
    name: "SanDisk Extreme 500GB Portable SSD",
    price: 1489.99,
    description: "SSD portátil resistente, ideal para llevar tus proyectos y juegos.",
    image: "/img/Productos/sand.jpg",
    category: "almacenamiento"
  },
  {
    id: 22,
    name: "NZXT H510 Flow",
    price: 2550.99,
    description: "Gabinete con excelente flujo de aire y diseño minimalista.",
    image: "/img/Productos/nzx1.jpg",
    category: "gabinetes"
  },
  {
    id: 23,
    name: "Corsair 4000D Airflow",
    price: 2719.99,
    description: "Excelente ventilación y espacio para builds de alto rendimiento.",
    image: "/img/Productos/corsairgab.jpg",
    category: "gabinetes"
  },
  {
    id: 24,
    name: "Lian Li PC-O11 Dynamic",
    price: 2189.99,
    description: "Diseño premium con múltiples paneles de vidrio y espacio para personalización.",
    image: "/img/Productos/lian.jpg",
    category: "gabinetes"
  },
  {
    id: 25,
    name: "Fractal Design Meshify C",
    price: 2509.99,
    description: "Gabinete con diseño en malla para máxima ventilación y silencio.",
    image: "/img/Productos/fract.jpg", 
    category: "gabinetes"
  },
  {
    id: 26,
    name: "ASUS ROG Strix B550-F Gaming",
    price: 3199.73,
    description: "Placa madre AM4 para Ryzen, con Wi-Fi y RGB controlable.",
    image: "/img/Productos/asusmb.jpg",
    category: "placas"
  },
  {
    id: 27,
    name: "MSI B650 Tomahawk",
    price: 3249.27,
    description: "Placa AM5 para Ryzen 7000, con soporte DDR5 y PCIe 5.0.",
    image: "/img/Productos/msi.jpg",
    category: "placas"
  },
  {
    id: 28,
    name: "Gigabyte Z790 AORUS Elite",
    price: 3279.30,
    description: "Placa para Intel 13th Gen, con soporte DDR5 y múltiples NVMe.",
    image: "/img/Productos/giga.jpg",
    category: "placas"
  },
  {
    id: 29,
    name: "ASUS TUF Gaming X570-Plus",
    price: 3689.69,
    description: "Placa robusta para Ryzen, ideal para gaming y productividad.",
    image: "/img/Productos/asus1.jpg",
    category: "placas"
  },
  {
    id: 30,
    name: "MSI MAG B760 Tomahawk",
    price: 3219.58,
    description: "Placa para Intel 12th/13th Gen, con buen rendimiento y conectividad.",
    image: "/img/Productos/msimb.jpg",
    category: "placas"
  }
];

let carts = {};

app.post('/cart/:productId', (req, res) => {
  const sessionId = req.headers.sessionid;
  const { quantity = 1 } = req.body;
  const productId = parseInt(req.params.productId);

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId requerido en headers' });
  }

  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  if (!carts[sessionId]) carts[sessionId] = {};
  carts[sessionId][productId] = (carts[sessionId][productId] || 0) + quantity;


  if (publisher.connected) {
    publisher.publish('cart:updated', JSON.stringify({
      sessionId,
      productId,
      quantity,
      productName: product.name
    }));
    console.log(`Evento publicado en Redis: cart:updated para ${sessionId}`);
  }

  res.json({ message: 'Producto añadido', cart: carts[sessionId] });
});

app.get('/cart', (req, res) => {
  const sessionId = req.headers.sessionid;
  if (!sessionId) return res.status(400).json({ error: 'sessionId requerido en headers' });
  res.json(carts[sessionId] || {});
});

app.listen(PORT, () => {
  console.log(`cart-service corriendo en http://localhost:${PORT}`);
});