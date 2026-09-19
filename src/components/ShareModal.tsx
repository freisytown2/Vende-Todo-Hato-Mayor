import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Facebook,
  Send,
} from 'lucide-react';
import { formatRDPrice } from '../utils/imageCompressor';

export const ShareModal: React.FC = () => {
  const { isShareModalOpen, closeShareModal, activeShareListing, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isShareModalOpen || !activeShareListing) return null;

  // Build direct clean sharing link (compatible with custom domain and preview)
  const domainBase = window.location.origin;
  const currentUrl = `${domainBase}/producto/${activeShareListing.id}`;
  const shareText = `Mira este artículo en Vende Todo en Hato Mayor: "${activeShareListing.title}" por solo ${formatRDPrice(activeShareListing.price)}. ¡Disponible en Hato Mayor!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    showToast('¡Enlace copiado al portapapeles!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `${shareText} ${currentUrl}`
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      currentUrl
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleMessengerShare = () => {
    const url = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
      currentUrl
    )}&app_id=291494419107518&redirect_uri=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">Compartir Publicación</h3>
          </div>
          <button
            onClick={closeShareModal}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item preview */}
        <div className="flex items-center gap-3 my-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <img
            src={activeShareListing.images[0]}
            alt=""
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-slate-900 text-xs truncate">
              {activeShareListing.title}
            </h4>
            <span className="font-black text-emerald-600 text-sm">
              {formatRDPrice(activeShareListing.price)}
            </span>
          </div>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-3 gap-3 my-6">
          {/* WhatsApp */}
          <button
            onClick={handleWhatsAppShare}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xs font-bold">WhatsApp</span>
          </button>

          {/* Facebook */}
          <button
            onClick={handleFacebookShare}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
              <Facebook className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xs font-bold">Facebook</span>
          </button>

          {/* Messenger */}
          <button
            onClick={handleMessengerShare}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold">Messenger</span>
          </button>
        </div>

        {/* Copy Link Input box */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">Copiar enlace directo</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 select-all outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
