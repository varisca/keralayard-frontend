// =============================================================================
// Kerala Yard — Static data for categories, products, orders, addresses
// =============================================================================

// ---------------------------------------------------------------------------
// CATEGORIES
// ---------------------------------------------------------------------------
export const categories = [
  {
    id: 'cat_banana_chips',
    name: 'Banana Chips',
    slug: 'banana-chips',
    image: '/product_chips.png',
    bgColor: '#FFF3E0',
    icon: '🍌',
  },
  {
    id: 'cat_coconut_oil',
    name: 'Coconut Oil',
    slug: 'coconut-oil',
    image: '/product_coconut_oil.png',
    bgColor: '#F0F8F0',
    icon: '🥥',
  },
  {
    id: 'cat_spices',
    name: 'Spices',
    slug: 'spices',
    image: '/product_spices.png',
    bgColor: '#FFF8E1',
    icon: '🌶️',
  },
  // {
  //   id: 'cat_breakfast',
  //   name: 'Breakfast Items',
  //   slug: 'breakfast-items',
  //   image: null,
  //   bgColor: '#E8F5E9',
  //   icon: '🥣',
  // },
  // {
  //   id: 'cat_frozen',
  //   name: 'Frozen Foods',
  //   slug: 'frozen-foods',
  //   image: null,
  //   bgColor: '#E3F2FD',
  //   icon: '❄️',
  // },
  {
    id: 'cat_snacks',
    name: 'Homemade Snacks',
    slug: 'homemade-snacks',
    image: null,
    bgColor: '#FCE4EC',
    icon: '🧆',
  },
  // {
  //   id: 'cat_rice',
  //   name: 'Rice & Grains',
  //   slug: 'rice-grains',
  //   image: null,
  //   bgColor: '#F3E5F5',
  //   icon: '🌾',
  // },
  {
    id: 'cat_pickles',
    name: 'Pickles',
    slug: 'pickles',
    image: null,
    bgColor: '#FFFDE7',
    icon: '🫙',
  },
]

// ---------------------------------------------------------------------------
// PRODUCTS
// ---------------------------------------------------------------------------
export const dummyProducts = [
  // ── Banana Chips ──────────────────────────────────────────────────────────
  {
    id: 'prod_banana_chips_salted',
    name: 'Kerala Banana Chips (Salted)',
    slug: 'kerala-banana-chips-salted',
    description:
      'Crispy golden banana chips made from raw nendran bananas, fried in pure coconut oil with a hint of Himalayan pink salt. A timeless Kerala classic loved by all ages.',
    categoryId: 'cat_banana_chips',
    categoryName: 'Banana Chips',
    images: ['/product_chips.png'],
    mrp: 120,
    sellingPrice: 99,
    stock: 150,
    featured: true,
    active: true,
    tags: ['chips', 'banana', 'snack', 'coconut oil fried'],
    weight: '200g',
  },
  {
    id: 'prod_coconut_banana_chips',
    name: 'Coconut Banana Chips',
    slug: 'coconut-banana-chips',
    description:
      'A sweet-and-savoury fusion — nendran banana chips tossed with freshly grated coconut and a pinch of jaggery. Irresistibly addictive with every bite.',
    categoryId: 'cat_banana_chips',
    categoryName: 'Banana Chips',
    images: ['/product_chips.png'],
    mrp: 140,
    sellingPrice: 115,
    stock: 90,
    featured: false,
    active: true,
    tags: ['chips', 'coconut', 'banana', 'sweet'],
    weight: '200g',
  },

  // ── Coconut Oil ───────────────────────────────────────────────────────────
  {
    id: 'prod_coconut_oil_500ml',
    name: 'Pure Kerala Coconut Oil (500 ml)',
    slug: 'pure-kerala-coconut-oil-500ml',
    description:
      'Traditional wood-pressed virgin coconut oil sourced from certified organic coconut farms in Thrissur. Rich in lauric acid, free of additives and preservatives.',
    categoryId: 'cat_coconut_oil',
    categoryName: 'Coconut Oil',
    images: ['/product_coconut_oil.png'],
    mrp: 280,
    sellingPrice: 239,
    stock: 60,
    featured: true,
    active: true,
    tags: ['coconut oil', 'organic', 'virgin', '500ml'],
    weight: '500ml',
  },
  {
    id: 'prod_cold_pressed_coconut_oil_1l',
    name: 'Cold-Pressed Coconut Oil (1 L)',
    slug: 'cold-pressed-coconut-oil-1l',
    description:
      'Extra-virgin cold-pressed coconut oil retaining all natural nutrients. Ideal for cooking, hair care, and skin care. No heat treatment, no chemicals.',
    categoryId: 'cat_coconut_oil',
    categoryName: 'Coconut Oil',
    images: ['/product_coconut_oil.png'],
    mrp: 499,
    sellingPrice: 429,
    stock: 45,
    featured: true,
    active: true,
    tags: ['coconut oil', 'cold pressed', '1L', 'organic'],
    weight: '1L',
  },

  // ── Spices ────────────────────────────────────────────────────────────────
  {
    id: 'prod_pepper_powder',
    name: 'Kerala Pepper Powder',
    slug: 'kerala-pepper-powder',
    description:
      'Stone-ground black pepper from the spice gardens of Wayanad. Freshly milled to preserve the essential oils and bold pungency that Kerala pepper is famous for worldwide.',
    categoryId: 'cat_spices',
    categoryName: 'Spices',
    images: ['/product_spices.png'],
    mrp: 180,
    sellingPrice: 149,
    stock: 200,
    featured: false,
    active: true,
    tags: ['pepper', 'spice', 'wayanad', 'black pepper'],
    weight: '100g',
  },
  {
    id: 'prod_cardamom_100g',
    name: 'Cardamom (Elakka) 100g',
    slug: 'cardamom-elakka-100g',
    description:
      'Plump green cardamom pods handpicked from high-altitude plantations in Idukki. Intensely aromatic — perfect for chai, biryanis, and Kerala sweets.',
    categoryId: 'cat_spices',
    categoryName: 'Spices',
    images: ['/product_spices.png'],
    mrp: 350,
    sellingPrice: 299,
    stock: 80,
    featured: true,
    active: true,
    tags: ['cardamom', 'elakka', 'idukki', 'spice'],
    weight: '100g',
  },

  // ── Breakfast Items ────────────────────────────────────────────────────────
  {
    id: 'prod_puttu_podi_500g',
    name: 'Puttu Podi (500g)',
    slug: 'puttu-podi-500g',
    description:
      'Authentic Kerala rice flour for making soft, fluffy puttu. Made from parboiled red rice, stone-ground and sieved to the perfect texture. Ready in minutes with a puttu kutti.',
    categoryId: 'cat_breakfast',
    categoryName: 'Breakfast Items',
    images: [null],
    mrp: 95,
    sellingPrice: 79,
    stock: 120,
    featured: false,
    active: true,
    tags: ['puttu', 'breakfast', 'rice flour', 'kerala'],
    weight: '500g',
  },
  {
    id: 'prod_appam_mix_500g',
    name: 'Appam Mix (500g)',
    slug: 'appam-mix-500g',
    description:
      'Instant appam batter mix made from premium raw rice and coconut. Just add water and coconut milk for lacy, crispy-edged appams every morning. No fermentation required.',
    categoryId: 'cat_breakfast',
    categoryName: 'Breakfast Items',
    images: [null],
    mrp: 110,
    sellingPrice: 89,
    stock: 75,
    featured: false,
    active: true,
    tags: ['appam', 'breakfast', 'instant mix', 'coconut'],
    weight: '500g',
  },

  // ── Rice & Grains ──────────────────────────────────────────────────────────
  {
    id: 'prod_matta_rice_1kg',
    name: 'Kerala Matta Rice (1 kg)',
    slug: 'kerala-matta-rice-1kg',
    description:
      'Traditional Kerala red parboiled rice (Rosematta) grown in the paddy fields of Palakkad. Nutty flavour, high fibre, and rich in minerals. The staple of every Kerala household.',
    categoryId: 'cat_rice',
    categoryName: 'Rice & Grains',
    images: [null],
    mrp: 90,
    sellingPrice: 74,
    stock: 200,
    featured: false,
    active: true,
    tags: ['rice', 'matta', 'red rice', 'palakkad', 'grain'],
    weight: '1kg',
  },

  // ── Pickles ───────────────────────────────────────────────────────────────
  {
    id: 'prod_mango_pickle_300g',
    name: 'Mango Pickle (Avakkai) 300g',
    slug: 'mango-pickle-avakkai-300g',
    description:
      'Bold and tangy raw mango pickle made with Kerala\'s signature blend of mustard, red chilli, and sesame oil. Handcrafted in small batches following a traditional Nair family recipe.',
    categoryId: 'cat_pickles',
    categoryName: 'Pickles',
    images: [null],
    mrp: 160,
    sellingPrice: 135,
    stock: 55,
    featured: true,
    active: true,
    tags: ['pickle', 'mango', 'avakkai', 'spicy', 'homemade'],
    weight: '300g',
  },

  // ── Homemade Snacks ────────────────────────────────────────────────────────
  {
    id: 'prod_homemade_mixture_200g',
    name: 'Homemade Mixture 200g',
    slug: 'homemade-mixture-200g',
    description:
      'A crunchy medley of Kerala-style sev, fried peanuts, curry leaves, and roasted chana tossed in aromatic spices. Made fresh in small batches — no artificial colours or preservatives.',
    categoryId: 'cat_snacks',
    categoryName: 'Homemade Snacks',
    images: [null],
    mrp: 130,
    sellingPrice: 109,
    stock: 40,
    featured: false,
    active: true,
    tags: ['mixture', 'snack', 'crunchy', 'homemade'],
    weight: '200g',
  },
  {
    id: 'prod_kerala_murukku_200g',
    name: 'Kerala Murukku 200g',
    slug: 'kerala-murukku-200g',
    description:
      'Crispy spiral murukkus made from rice flour and urad dal, seasoned with cumin and sesame seeds, deep-fried in coconut oil. A beloved tea-time snack across Kerala.',
    categoryId: 'cat_snacks',
    categoryName: 'Homemade Snacks',
    images: [null],
    mrp: 115,
    sellingPrice: 95,
    stock: 60,
    featured: false,
    active: true,
    tags: ['murukku', 'snack', 'rice flour', 'tea-time'],
    weight: '200g',
  },
]

// ---------------------------------------------------------------------------
// DUMMY ORDERS
// ---------------------------------------------------------------------------
export const dummyOrders = [
  {
    id: 'order_001',
    userId: 'user_demo_001',
    items: [
      { productId: 'prod_banana_chips_salted', qty: 2, sellingPrice: 99, name: 'Kerala Banana Chips (Salted)' },
      { productId: 'prod_coconut_oil_500ml', qty: 1, sellingPrice: 239, name: 'Pure Kerala Coconut Oil (500 ml)' },
    ],
    amount: 437,
    address: {
      fullName: 'Priya Menon',
      phone: '9876543210',
      addressLine1: '14/B Mananchira Road',
      addressLine2: 'Near SM Street',
      city: 'Kozhikode',
      state: 'Kerala',
      pincode: '673001',
    },
    status: 'delivered',
    paymentMethod: 'razorpay',
    paymentStatus: 'paid',
    createdAt: '2026-05-10T09:30:00.000Z',
    updatedAt: '2026-05-13T14:00:00.000Z',
  },
  {
    id: 'order_002',
    userId: 'user_demo_002',
    items: [
      { productId: 'prod_cardamom_100g', qty: 1, sellingPrice: 299, name: 'Cardamom (Elakka) 100g' },
      { productId: 'prod_mango_pickle_300g', qty: 2, sellingPrice: 135, name: 'Mango Pickle (Avakkai) 300g' },
      { productId: 'prod_kerala_murukku_200g', qty: 1, sellingPrice: 95, name: 'Kerala Murukku 200g' },
    ],
    amount: 664,
    address: {
      fullName: 'Arjun Nair',
      phone: '9123456789',
      addressLine1: 'TC 5/1234 Pattom',
      addressLine2: 'Opposite to Pattom Palace',
      city: 'Thiruvananthapuram',
      state: 'Kerala',
      pincode: '695004',
    },
    status: 'processing',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    createdAt: '2026-05-19T11:00:00.000Z',
    updatedAt: '2026-05-19T11:00:00.000Z',
  },
  {
    id: 'order_003',
    userId: 'user_demo_001',
    items: [
      { productId: 'prod_cold_pressed_coconut_oil_1l', qty: 1, sellingPrice: 429, name: 'Cold-Pressed Coconut Oil (1 L)' },
      { productId: 'prod_puttu_podi_500g', qty: 2, sellingPrice: 79, name: 'Puttu Podi (500g)' },
      { productId: 'prod_matta_rice_1kg', qty: 1, sellingPrice: 74, name: 'Kerala Matta Rice (1 kg)' },
    ],
    amount: 661,
    address: {
      fullName: 'Priya Menon',
      phone: '9876543210',
      addressLine1: '14/B Mananchira Road',
      addressLine2: 'Near SM Street',
      city: 'Kozhikode',
      state: 'Kerala',
      pincode: '673001',
    },
    status: 'shipped',
    paymentMethod: 'razorpay',
    paymentStatus: 'paid',
    createdAt: '2026-05-20T16:45:00.000Z',
    updatedAt: '2026-05-21T08:00:00.000Z',
  },
]

// ---------------------------------------------------------------------------
// DUMMY ADDRESSES
// ---------------------------------------------------------------------------
export const dummyAddresses = [
  {
    id: 'addr_001',
    userId: 'user_demo_001',
    fullName: 'Priya Menon',
    phone: '9876543210',
    addressLine1: '14/B Mananchira Road',
    addressLine2: 'Near SM Street',
    city: 'Kozhikode',
    state: 'Kerala',
    pincode: '673001',
    isDefault: true,
  },
  {
    id: 'addr_002',
    userId: 'user_demo_002',
    fullName: 'Arjun Nair',
    phone: '9123456789',
    addressLine1: 'TC 5/1234 Pattom',
    addressLine2: 'Opposite to Pattom Palace',
    city: 'Thiruvananthapuram',
    state: 'Kerala',
    pincode: '695004',
    isDefault: true,
  },
]
