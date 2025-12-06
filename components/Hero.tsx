import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

export default function Hero() {
  return (
    <section id="home" className="py-32 px-4 sm:px-6 lg:px-8 bg-[#ccf5d1]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-center md:text-left">
            <h2 className="text-5xl md:text-7xl font-black leading-tight text-[#1b5e20]">
              Welcome to <span className="text-[#689f38]">Local Bazar</span>
            </h2>
            <p className="text-2xl font-semibold leading-relaxed text-[#2e7d32]">
              Discover the best local products with lightning-fast delivery from trusted sellers in your community.
            </p>
            <div className="flex justify-center md:justify-start">
              <Link href="/products">
                <button 
                  className="group px-12 py-6 text-white font-black text-xl rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 flex items-center gap-3 bg-[#689f38] hover:bg-[#1b5e20]"
                >
                  Explore Products 
                  <FiArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
                </button>
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="bg-white rounded-3xl shadow-2xl p-16 transform hover:scale-105 transition-transform duration-300 border-t-8 border-[#689f38]">
              <div className="text-center">
                <div className="text-9xl mb-6">🛒</div>
                <p className="text-3xl font-black text-[#1b5e20]">Local & Fresh</p>
                <p className="text-lg font-semibold mt-3 text-[#689f38]">Shop from your neighborhood</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
