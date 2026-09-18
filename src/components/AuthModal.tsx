import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MUNICIPALITIES } from '../data/initialData';
import { X, LogIn, UserPlus, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register, showToast } = useApp();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login inputs
  const [loginEmail, setLoginEmail] = useState('carlos@hatomayor.do');
  const [loginPassword, setLoginPassword] = useState('123456');

  // Register inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [municipality, setMunicipality] = useState('Hato Mayor del Rey');
  const [sector, setSector] = useState('Las Malvinas');

  if (!isAuthModalOpen) return null;

  const sectors =
    MUNICIPALITIES.find((m) => m.name === municipality)?.sectors || MUNICIPALITIES[0].sectors;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(loginEmail, loginPassword);
    if (!success) {
      showToast('Credenciales incorrectas');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      showToast('Por favor completa todos los campos requeridos');
      return;
    }

    const success = register(
      name.trim(),
      email.trim(),
      phone.trim(),
      sector,
      municipality,
      password.trim()
    );

    if (success) {
      closeAuthModal();
    }
  };

  // Demo accounts helper
  const fillQuickAccount = (role: 'seller' | 'admin') => {
    if (role === 'seller') {
      setTab('login');
      setLoginEmail('carlos@hatomayor.do');
      setLoginPassword('123456');
    } else {
      setTab('login');
      setLoginEmail('admin@hatomayor.do');
      setLoginPassword('123456');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              {tab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta en Hato Mayor'}
            </h3>
            <p className="text-xs text-slate-500">
              {tab === 'login'
                ? 'Accede para publicar, vender y responder mensajes'
                : 'Únete gratis al marketplace local'}
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 my-5 text-xs font-bold">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Ingresar</span>
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Registrarme</span>
          </button>
        </div>

        {/* Form */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correo electrónico o teléfono
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ejemplo@hatomayor.do"
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••"
                required
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer mt-2"
            >
              Iniciar Sesión
            </button>

            {/* Quick Demo Switcher */}
            <div className="pt-4 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-400 block mb-2 font-medium">
                Cuentas de demostración rápida:
              </span>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fillQuickAccount('seller')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold"
                >
                  👤 Vendedor (Carlos)
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickAccount('admin')}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-bold border border-amber-200"
                >
                  👑 Administrador Hato Mayor
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre y apellido o negocio
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Juan de los Santos"
                required
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Correo</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juan@gmail.com"
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="809-553-0000"
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Municipio</label>
                <select
                  aria-label="Seleccionar municipio de registro"
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {MUNICIPALITIES.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sector o barrio</label>
                <select
                  aria-label="Seleccionar sector de registro"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {sectors.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Crear Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-500 border border-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Tu dirección residencial nunca se hará pública.</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer"
            >
              Completar Registro Gratuito
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
