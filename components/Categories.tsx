import Link from 'next/link';

const categories = [
  {
    emoji: '🥬',
    name: 'Vegetables',
    description: 'Fresh & Organic',
    bgColor: '#fef2f2',
    slug: 'vegetables'
  },
  {
    emoji: '🍎',
    name: 'Fruits',
    description: 'Seasonal & Sweet',
    bgColor: '#fff7ed',
    slug: 'fruits'
  },
  {
    emoji: '🧀',
    name: 'Dairy & More',
    description: 'Pure & Healthy',
    bgColor: '#fef3c7',
    slug: 'dairy-more'
  },
  {
    emoji: '👔',
    name: 'Clothing',
    description: 'Trendy & Stylish',
    bgColor: '#eff6ff',
    slug: 'clothing'
  },
  {
    emoji: '📱',
    name: 'Electronics',
    description: 'Latest Tech',
    bgColor: '#f0fdf4',
    slug: 'electronics'
  },
  {
    emoji: '🏠',
    name: 'Home & Kitchen',
    description: 'Modern & Functional',
    bgColor: '#faf5ff',
    slug: 'home-kitchen'
  },
  {
    emoji: '📚',
    name: 'Books',
    description: 'Knowledge & Stories',
    bgColor: '#f5f3ff',
    slug: 'books'
  },
  {
    emoji: '⚽',
    name: 'Sports',
    description: 'Active & Fit',
    bgColor: '#ecfdf5',
    slug: 'sports'
  },
  {
    emoji: '💄',
    name: 'Beauty',
    description: 'Care & Glow',
    bgColor: '#fdf2f8',
    slug: 'beauty'
  },
  {
    emoji: '🎮',
    name: 'Toys',
    description: 'Fun & Games',
    bgColor: '#fef9c3',
    slug: 'toys'
  },
  {
    emoji: '🍔',
    name: 'Food & Beverages',
    description: 'Taste & Enjoy',
    bgColor: '#fffbeb',
    slug: 'food-beverages'
  },
  {
    emoji: '🪑',
    name: 'Furniture',
    description: 'Comfort & Style',
    bgColor: '#f3e8ff',
    slug: 'furniture'
  },
  {
    emoji: '🚗',
    name: 'Automotive',
    description: 'Drive & Go',
    bgColor: '#ecf0f1',
    slug: 'automotive'
  }
];

export default function Categories() {
  return (
    <section id="categories" className="py-32 px-4 sm:px-6 lg:px-8 bg-[#ccf5d1]">
      <div className="max-w-7xl mx-auto ">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-black mb-6 text-[#1b5e20]">
            Popular Categories
          </h2>
          <p className="text-2xl font-semibold text-[#2e7d32]">Browse products from your favorite categories</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <Link key={index} href={`/category/${category.slug}`}>
              <div 
                className="rounded-3xl p-12 text-center shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 cursor-pointer h-full"
                style={{ backgroundColor: category.bgColor }}
              >
                <div className="text-8xl mb-6 flex justify-center">
                  {category.emoji}
                </div>
                <h3 className="text-3xl font-black mb-3 text-[#1b5e20]">{category.name}</h3>
                <p className="text-lg font-semibold text-[#689f38]">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
