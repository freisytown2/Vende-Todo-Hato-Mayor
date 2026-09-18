import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ListingCard } from './ListingCard';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  ShieldCheck,
  Package,
  CheckCircle2,
  Phone,
} from 'lucide-react';
import { formatPhoneNumber } from '../utils/imageCompressor';

export const SellerProfile: React.FC = () => {
  const { listings, allUsers, selectedSellerId, setActiveView } = useApp();
  const [activeTab, setActiveTab] = useState<'available' | 'sold'>('available');

  // Find user data
  const seller = allUsers.find((u) => u.id === selectedSellerId);
  const sellerListings = listings.filter((l) => l.sellerId === selectedSellerId);

  // If no user in list (e.g. from static demo), get from listing info
  const firstListing = sellerListings[0];
  const displayName = seller?.name || firstListing?.sellerName || 'Vendedor de Hato Mayor';
  const displaySector = seller?.sector || firstListing?.sector || 'Hato Mayor del Rey';
  const displayMuni = seller?.municipality || firstListing?.municipality || 'Hato Mayor del Rey';
  const joinDate = seller?.joinedDate || firstListing?.sellerJoinedDate || firstListing?.createdAt;

  const availableListings = sellerListings.filter((l) => l.status !== 'Vendido');
  const soldListings = sellerListings.filter((l) => l.status === 'Vendido');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => setActiveView('home')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al marketplace</span>
      </button>

      {/* Seller Header Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{displayName}</h1>
                <span className="p-1 rounded-full bg-emerald-100 text-emerald-700" title="Vendedor verificado">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {displayMuni}, sector {displaySector}
                </span>

                {joinDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Miembro desde{' '}
                    {new Date(joinDate).toLocaleDateString('es-DO', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats summary */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none text-center bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-2xl">
              <span className="block text-lg font-black text-slate-900">{availableListings.length}</span>
              <span className="text-[11px] text-slate-500">Activas</span>
            </div>
            <div className="flex-1 sm:flex-none text-center bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-2xl">
              <span className="block text-lg font-black text-emerald-600">{soldListings.length}</span>
              <span className="text-[11px] text-slate-500">Vendidas</span>
            </div>
          </div>
        </div>

        {/* Privacy notice banner */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Perfil verificado en la comunidad de Hato Mayor. Por seguridad, no se expone dirección residencial ni datos privados innecesarios.
          </span>
        </div>
      </div>

      {/* Listings Tabs */}
      <div className="border-b border-slate-200 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('available')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'available'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Publicaciones Activas ({availableListings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sold')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'sold'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Historial Vendido ({soldListings.length})</span>
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      {activeTab === 'available' ? (
        availableListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {availableListings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No hay publicaciones activas por el momento</p>
          </div>
        )
      ) : soldListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {soldListings.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">Aún no tiene artículos en su historial de vendidos</p>
        </div>
      )}
    </div>
  );
};
