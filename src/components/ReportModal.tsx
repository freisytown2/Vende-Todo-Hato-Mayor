import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ReportReason } from '../types';
import { X, Flag, AlertTriangle } from 'lucide-react';

const REASONS: { id: ReportReason; label: string; desc: string }[] = [
  {
    id: 'Producto prohibido',
    label: 'Producto prohibido',
    desc: 'Armas, sustancias ilícitas, animales protegidos o artículos no autorizados.',
  },
  {
    id: 'Estafa o posible fraude',
    label: 'Estafa o posible fraude',
    desc: 'Pide depósitos adelantados sin entregar el producto o precios engañosos.',
  },
  {
    id: 'Información falsa',
    label: 'Información falsa',
    desc: 'Fotos de internet que no coinciden con el producto real o datos engañosos.',
  },
  {
    id: 'Publicación duplicada',
    label: 'Publicación duplicada',
    desc: 'El mismo artículo ha sido publicado varias veces de forma repetitiva.',
  },
  {
    id: 'Contenido ofensivo',
    label: 'Contenido ofensivo',
    desc: 'Lenguaje inapropiado, discriminatorio o fotos no aptas para todo público.',
  },
  {
    id: 'Otro',
    label: 'Otro motivo',
    desc: 'Cualquier otra razón que vulnere la seguridad de la comunidad.',
  },
];

export const ReportModal: React.FC = () => {
  const { isReportModalOpen, closeReportModal, activeReportListing, submitReport } = useApp();
  const [selectedReason, setSelectedReason] = useState<ReportReason>('Estafa o posible fraude');
  const [details, setDetails] = useState('');

  if (!isReportModalOpen || !activeReportListing) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;

    submitReport(activeReportListing.id, selectedReason, details.trim());

    setDetails('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Reportar Publicación</h3>
              <span className="text-xs text-slate-500">
                Ayuda a mantener seguro el comercio en Hato Mayor
              </span>
            </div>
          </div>
          <button
            onClick={closeReportModal}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
            <span className="text-slate-500 block">Artículo reportado:</span>
            <span className="font-bold text-slate-800 text-sm">
              {activeReportListing.title}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">
              Motivo del reporte:
            </label>
            <div className="space-y-2">
              {REASONS.map((r) => (
                <label
                  key={r.id}
                  onClick={() => setSelectedReason(r.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedReason === r.id
                      ? 'bg-rose-50/50 border-rose-400 ring-1 ring-rose-400'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    checked={selectedReason === r.id}
                    onChange={() => setSelectedReason(r.id)}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900">{r.label}</span>
                    <span className="block text-[11px] text-slate-500">{r.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wider">
              Detalles adicionales o evidencia:
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              required
              placeholder="Explica qué ocurrió o por qué consideras que esta publicación incumple las normas..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-50 text-[11px] text-amber-900 flex items-start gap-2 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              Los reportes son revisados directamente por los moderadores de Hato Mayor. Tu reporte es anónimo ante el vendedor.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeReportModal}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20"
            >
              Enviar Reporte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
