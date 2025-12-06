"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiMapPin } from 'react-icons/fi';

export default function AddAddressManuallyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    pincode: '',
    street: '',
    village: '',
    mandal: '',
    district: '',
    state: '',
    country: '',
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // TODO: Save address to backend
    router.push('/auth/profile');
  };

  return (
    <div className="min-h-screen bg-[#e8f5e9] flex flex-col items-center justify-center py-10 px-4">
      <h1 className="text-3xl font-bold text-[#1b5e20] mb-6 flex items-center gap-2"><FiMapPin /> Add Address Manually</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6 grid grid-cols-1 gap-4">
        <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" className="border rounded-lg px-4 py-2" />
        <input name="street" value={form.street} onChange={handleChange} placeholder="Street" className="border rounded-lg px-4 py-2" />
        <input name="village" value={form.village} onChange={handleChange} placeholder="Village" className="border rounded-lg px-4 py-2" />
        <input name="mandal" value={form.mandal} onChange={handleChange} placeholder="Mandal" className="border rounded-lg px-4 py-2" />
        <input name="district" value={form.district} onChange={handleChange} placeholder="District" className="border rounded-lg px-4 py-2" />
        <input name="state" value={form.state} onChange={handleChange} placeholder="State" className="border rounded-lg px-4 py-2" />
        <input name="country" value={form.country} onChange={handleChange} placeholder="Country" className="border rounded-lg px-4 py-2" />
        <button type="submit" className="bg-[#689f38] text-white font-bold py-2 rounded-lg">Save Address</button>
      </form>
    </div>
  );
}
