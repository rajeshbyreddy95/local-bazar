'use client';

import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Message sent! Thank you for contacting us.');
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-32 px-4 sm:px-6 lg:px-8 bg-[#ccf5d1]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black mb-6 text-[#1b5e20]">
            Get in Touch
          </h2>
          <p className="text-2xl font-semibold text-[#2e7d32]">Have questions? We'd love to hear from you.</p>
        </div>
        
        <div className="bg-white rounded-3xl p-12 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-xl font-black mb-3 text-[#1b5e20]">Name</label>
              <input 
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
                className="w-full px-6 py-4 border-3 border-[#ccf5d1] rounded-xl focus:outline-none focus:border-[#689f38] transition-colors text-lg font-semibold"
              />
            </div>
            
            <div>
              <label className="block text-xl font-black mb-3 text-[#1b5e20]">Email</label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                className="w-full px-6 py-4 border-3 border-[#ccf5d1] rounded-xl focus:outline-none focus:border-[#689f38] transition-colors text-lg font-semibold"
              />
            </div>
            
            <div>
              <label className="block text-xl font-black mb-3 text-[#1b5e20]">Message</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message here..."
                rows={5}
                required
                className="w-full px-6 py-4 border-3 border-[#ccf5d1] rounded-xl focus:outline-none focus:border-[#689f38] transition-colors resize-none text-lg font-semibold"
              ></textarea>
            </div>
            
            <button 
              type="submit"
              className="w-full py-6 rounded-xl text-white font-black text-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-[#689f38] hover:bg-[#1b5e20]"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
