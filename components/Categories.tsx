import Link from 'next/link';
import { GiTomato, GiAppleSeeds, GiCheeseWedge, GiClothes } from 'react-icons/gi';

const categories = [
  {
    icon: <GiTomato />,
    name: 'Vegetables',
    description: 'Fresh & Organic',
    color: 'text-red-500',
    bgColor: '#fef2f2',
    slug: 'vegetables'
  },
  {
    icon: <GiAppleSeeds />,
    name: 'Food & Beverages',
    description: 'Seasonal & Sweet',
    color: 'text-yellow-600',
    bgColor: '#fffbeb',
    slug: 'Food & Beverages'
  },
  {
    icon: <GiCheeseWedge />,
    name: 'Dairy & More',
    description: 'Pure & Healthy',
    color: 'text-orange-500',
    bgColor: '#fff7ed',
    slug: 'dairy-more'
  },
  {
    icon: <GiClothes />,
    name: 'Clothing',
    description: 'Trendy & Stylish',
    color: 'text-blue-600',
    bgColor: '#eff6ff',
    slug: 'clothing'
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
                <div className={`text-8xl mb-6 ${category.color} flex justify-center`}>
                  {category.icon}
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
