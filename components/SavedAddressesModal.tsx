'use client';
import { useEffect, useState } from 'react';
import { FiX, FiEdit, FiTrash2, FiMapPin, FiCheck } from 'react-icons/fi';

interface Address {
  _id: string;
  lat: number;
  lng: number;
  fullAddress: string;
  pincode: string;
  street: string;
  village: string;
  mandal: string;
  district: string;
  state: string;
  country: string;
}

interface SavedAddressesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SavedAddressesModal({ isOpen, onClose }: SavedAddressesModalProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Address | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
    }
  }, [isOpen]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/address?t=${Date.now()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      const data = await response.json();
      console.log('Fetched addresses:', data);
      setAddresses(data.addresses || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingId(address._id);
    setEditForm({ ...address });
  };

  const handleUpdate = async () => {
    if (!editForm) return;
    try {
      const response = await fetch('/api/address', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: editForm._id,
          lat: editForm.lat,
          lng: editForm.lng,
          address: editForm.fullAddress,
          pincode: editForm.pincode,
          street: editForm.street,
          village: editForm.village,
          mandal: editForm.mandal,
          district: editForm.district,
          state: editForm.state,
          country: editForm.country,
        }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditForm(null);
        fetchAddresses();
      }
    } catch (error) {
      console.error('Error updating address:', error);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      setDeleting(addressId);
      const response = await fetch(`/api/address?id=${addressId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAddresses();
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    } finally {
      setDeleting(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-[#689f38] p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1b5e20] flex items-center gap-2">
            <FiMapPin className="text-[#689f38]" />
            Saved Addresses
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition text-2xl"
          >
            <FiX />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-[#689f38]"></div>
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No saved addresses yet</p>
              <p className="text-sm">Start by adding your first address</p>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-[#689f38] transition"
                >
                  {editingId === address._id && editForm ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.fullAddress}
                        onChange={(e) =>
                          setEditForm({ ...editForm, fullAddress: e.target.value })
                        }
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        placeholder="Full Address"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editForm.pincode}
                          onChange={(e) =>
                            setEditForm({ ...editForm, pincode: e.target.value })
                          }
                          className="border rounded-lg px-3 py-2 text-sm"
                          placeholder="Pincode"
                        />
                        <input
                          type="text"
                          value={editForm.street}
                          onChange={(e) =>
                            setEditForm({ ...editForm, street: e.target.value })
                          }
                          className="border rounded-lg px-3 py-2 text-sm"
                          placeholder="Street"
                        />
                        <input
                          type="text"
                          value={editForm.village}
                          onChange={(e) =>
                            setEditForm({ ...editForm, village: e.target.value })
                          }
                          className="border rounded-lg px-3 py-2 text-sm"
                          placeholder="Village"
                        />
                        <input
                          type="text"
                          value={editForm.mandal}
                          onChange={(e) =>
                            setEditForm({ ...editForm, mandal: e.target.value })
                          }
                          className="border rounded-lg px-3 py-2 text-sm"
                          placeholder="Mandal"
                        />
                        <input
                          type="text"
                          value={editForm.district}
                          onChange={(e) =>
                            setEditForm({ ...editForm, district: e.target.value })
                          }
                          className="border rounded-lg px-3 py-2 text-sm"
                          placeholder="District"
                        />
                        <input
                          type="text"
                          value={editForm.state}
                          onChange={(e) =>
                            setEditForm({ ...editForm, state: e.target.value })
                          }
                          className="border rounded-lg px-3 py-2 text-sm"
                          placeholder="State"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdate}
                          className="flex-1 bg-[#689f38] text-white py-2 rounded-lg hover:bg-[#1b5e20] transition flex items-center justify-center gap-2"
                        >
                          <FiCheck /> Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditForm(null);
                          }}
                          className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-[#1b5e20] mb-2">
                        {address.fullAddress}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        <p><span className="font-medium">Pincode:</span> {address.pincode || '-'}</p>
                        <p><span className="font-medium">Street:</span> {address.street || '-'}</p>
                        <p><span className="font-medium">Village:</span> {address.village || '-'}</p>
                        <p><span className="font-medium">Mandal:</span> {address.mandal || '-'}</p>
                        <p><span className="font-medium">District:</span> {address.district || '-'}</p>
                        <p><span className="font-medium">State:</span> {address.state || '-'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(address)}
                          className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
                        >
                          <FiEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(address._id)}
                          disabled={deleting === address._id}
                          className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <FiTrash2 />
                          {deleting === address._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-[#689f38] p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#689f38] text-white rounded-lg hover:bg-[#1b5e20] transition font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
