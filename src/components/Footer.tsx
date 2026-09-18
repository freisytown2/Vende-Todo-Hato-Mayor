import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, MapPin, Phone, Lock, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCategoryFilter, setActiveView, categories } = useApp();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm mt-16">
      {/* Safety highlight banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border-b border-slate-800/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Privacidad Residencial</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Protegemos la dirección exacta de las viviendas. Solo se muestra el sector general hasta acordar la entrega de mutuo acuerdo.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Encuentros Seguros</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Recomendamos coordinar entregas en lugares concurridos como el Parque Central Mercedes de la Rocha o negocios comerciales reconocidos.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Comercio 100% Local</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Diseñado exclusivamente para impulsar la economía de familias, emprendedores y negocios de Hato Mayor, El Valle y Sabana de la Mar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
                HM
              </div>
              <span className="text-white font-bold text-base">Vende Todo en Hato Mayor</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              La plataforma oficial de compra, venta y trueque directo entre vecinos, campesinos, comercios y profesionales de la provincia de Hato Mayor, República Dominicana.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <MapPin className="w-4 h-4" />
              <span>Hato Mayor del Rey • El Valle • Sabana de la Mar</span>
            </div>
          </div>

          {/* Col 2: Popular Categories */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Categorías Populares</h4>
            <ul className="space-y-1.5 text-xs">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setCategoryFilter(cat.id)}
                    className="hover:text-emerald-400 transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Sectores y Cobertura */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Comunidades y Sectores</h4>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {[
                'Las Malvinas',
                'Villa Canto',
                'Ondina',
                'Puerto Rico',
                'La China',
                'Los Girasoles',
                'El Valle',
                'Sabana de la Mar',
                'Guayabo Dulce',
                'Jalonga',
                'Mata Palacio',
              ].map((sector) => (
                <span
                  key={sector}
                  className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400"
                >
                  {sector}
                </span>
              ))}
            </div>
          </div>

          {/* Col 4: Seguridad & Contacto */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Consejos para Compradores</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• Revisa el artículo personalmente antes de pagar.</li>
              <li>• Prefiere pagos en efectivo o transferencias al momento.</li>
              <li>• No envíes dinero por adelantado sin verificar al vendedor.</li>
              <li>• Acuerda el encuentro en un punto público seguro.</li>
            </ul>
            <div className="mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={() => setActiveView('publish')}
                className="w-full text-center py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs border border-slate-700 transition-colors"
              >
                + Publicar un artículo ahora
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Vende Todo en Hato Mayor. Desarrollado para la comunidad dominicana.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Privacidad Protegida</span>
            <span>•</span>
            <span>Términos y Condiciones</span>
            <span>•</span>
            <span>Seguridad Local</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
