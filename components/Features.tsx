import { MdLocalShipping } from 'react-icons/md';
import { FaLeaf, FaTag, FaShoppingCart } from 'react-icons/fa';

const features = [
  {
    icon: <MdLocalShipping />,
    title: 'Fast Delivery',
    description: 'Get your orders delivered within 24 hours to your doorstep with care.',
    color: '#689f38'
  },
  {
    icon: <FaLeaf />,
    title: 'Local Sellers',
    description: 'Support local businesses and get authentic, quality products directly from sellers.',
    color: '#2e7d32'
  },
  {
    icon: <FaTag />,
    title: 'Best Prices',
    description: 'Enjoy competitive pricing with no hidden charges. Transparency guaranteed.',
    color: '#1b5e20'
  },
  {
    icon: <FaShoppingCart />,
    title: 'Easy Shopping',
    description: 'Browse, select, and checkout in minutes with our user-friendly platform.',
    color: '#558b2f'
  }
];

export default function Features() {
  return (
    <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 bg-[#ccf5d1]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-black mb-6 text-[#1b5e20]">
            Why Our Customers Love Us
          </h2>
          <p className="text-2xl font-semibold text-[#2e7d32]">Experience the best online marketplace for local products</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-3 text-center w-full border-b-[6px]"
              style={{ borderBottomColor: feature.color }}
            >
              <div className="text-8xl mb-6 flex justify-center" style={{ color: feature.color }}>
                {feature.icon}
              </div>
              <h3 className="text-3xl font-black mb-4 text-[#1b5e20]">{feature.title}</h3>
              <p className="text-lg font-semibold leading-relaxed text-[#2e7d32]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
