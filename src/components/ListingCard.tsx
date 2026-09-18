import React from 'react';
import { Listing } from '../types';
import { useApp } from '../context/AppContext';
import { formatRDPrice, getWhatsAppUrl, formatRelativeTime } from '../utils/imageCompressor';
import {
  MapPin,
  Heart,
  MessageCircle,
  ShieldCheck,
  Store,
  Home,
  CheckCircle2,
  Clock,
  Sparkles,
  Share2,
  Trash2,
} from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const { openListingDetail, toggleFavorite, isFavorite, logContact, openShareModal, deleteListing, currentUser } = useApp();
  const favorite = isFavorite(listing.id);
  const isAdmin = currentUser?.role === 'admin' || currentUser?.email?.toLowerCase() === 'viralatoa@gmail.com';

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    logContact(listing.id, 'whatsapp');
    const url = getWhatsAppUrl(listing.whatsapp || listing.phone, listing.title);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(listing.id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openShareModal(listing);
  };

  const handleAdminDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`¿Administrador, deseas eliminar permanentemente "${listing.title}"?`)) {
      deleteListing(listing.id);
    }
  };

  // Meeting place icon & badge styling
  const renderMeetingBadge = () => {
    switch (listing.meetingPlaceType) {
      case 'public':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Lugar público seguro</span>
          </span>
        );
      case 'business':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            <Store className="w-3 h-3 text-blue-600" />
            <span>En negocio local</span>
          </span>
        );
      case 'home':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <Home className="w-3 h-3 text-amber-600" />
            <span>Casa (Dirección privada)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
            <MapPin className="w-3 h-3 text-slate-500" />
            <span>Punto a acordar</span>
          </span>
        );
    }
  };

  const primaryImage = listing.images && listing.images.length > 0
    ? listing.images[0]
    : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';

  return (
    <div
      onClick={() => openListingDetail(listing.id)}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/40 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col overflow-hidden relative"
    >
      {/* Image container with badges */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <img
          src={primaryImage}
          alt={listing.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Condition & Featured Pill */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs bg-slate-900/85 backdrop-blur-xs text-white">
            {listing.condition}
          </span>
          {listing.isFeatured && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs bg-amber-500 text-slate-950">
              <Sparkles className="w-3 h-3" />
              Destacado
            </span>
          )}
        </div>

        {/* Action buttons top right: Admin Delete, Share, Favorite */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {isAdmin && (
            <button
              onClick={handleAdminDelete}
              aria-label="Eliminar publicación"
              title="Eliminar publicación (Solo Administrador)"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-transform active:scale-90"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleShareClick}
            aria-label="Compartir publicación"
            title="Compartir publicación"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/90 hover:bg-white text-slate-700 hover:text-emerald-600 backdrop-blur-md shadow-md transition-transform active:scale-90"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleFavoriteClick}
            aria-label={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md shadow-md transition-transform active:scale-90 ${
              favorite
                ? 'bg-rose-500 text-white shadow-rose-500/30'
                : 'bg-white/90 text-slate-700 hover:text-rose-500 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Status Overlay if Sold or Reserved */}
        {listing.status === 'Vendido' && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-2xs flex items-center justify-center z-20">
            <span className="bg-red-600 text-white font-extrabold text-sm px-4 py-1.5 rounded-xl uppercase tracking-wider shadow-lg">
              Vendido
            </span>
          </div>
        )}
        {listing.status === 'Reservado' && (
          <div className="absolute top-2.5 left-2.5 z-20">
            <span className="bg-amber-600 text-white font-bold text-xs px-2.5 py-1 rounded-md uppercase tracking-wide shadow-md">
              Reservado
            </span>
          </div>
        )}
      </div>

      {/* Content body */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Price */}
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xl font-black text-slate-900 tracking-tight">
              {formatRDPrice(listing.price)}
            </span>
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(listing.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mt-1 group-hover:text-emerald-600 transition-colors leading-snug">
            {listing.title}
          </h3>

          {/* General Location (privacy safe) */}
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {listing.municipality}, sector {listing.sector}
            </span>
          </div>
        </div>

        {/* Bottom bar: Meeting type and quick WhatsApp CTA */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="truncate">
            {renderMeetingBadge()}
          </div>

          {/* Quick WhatsApp button */}
          <button
            onClick={handleWhatsAppClick}
            title="Enviar WhatsApp directo al vendedor"
            className="shrink-0 flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-colors shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
