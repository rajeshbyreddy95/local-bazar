const benefits = [
  {
    title: 'Community Focused',
    description: 'We believe in supporting local businesses and strengthening communities.'
  },
  {
    title: 'Quality Assured',
    description: 'Every product is verified by our team for quality and freshness.'
  },
  {
    title: 'Secure Payments',
    description: 'Multiple payment options with bank-level security for your peace of mind.'
  },
  {
    title: '24/7 Support',
    description: 'Our dedicated team is always ready to help you with any questions or issues.'
  }
];

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="py-32 px-4 sm:px-6 lg:px-8 bg-[#ccf5d1]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-center md:text-left">
            <h2 className="text-5xl md:text-6xl font-black text-[#1b5e20]">
              Why Choose Local Bazar?
            </h2>
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-5 justify-center md:justify-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#689f38]">
                      <span className="text-white text-2xl font-black">✓</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <h4 className="text-2xl font-black mb-2 text-[#1b5e20]">{benefit.title}</h4>
                    <p className="text-lg font-semibold leading-relaxed text-[#2e7d32]">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="bg-white rounded-3xl shadow-2xl p-16 transform hover:scale-105 transition-transform duration-300 border-l-8 border-[#689f38]">
              <div className="text-center">
                <div className="text-9xl mb-6">🌱</div>
                <p className="text-3xl font-black text-[#1b5e20]">Growing Together</p>
                <p className="text-lg font-semibold mt-3 text-[#689f38]">Building stronger communities</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
