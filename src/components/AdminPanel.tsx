import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatRDPrice, formatRelativeTime, formatPhoneNumber } from '../utils/imageCompressor';
import {
  ShieldCheck,
  Users,
  Package,
  Flag,
  Sparkles,
  BarChart3,
  Tags,
  CheckCircle,
  XCircle,
  Trash2,
  Edit3,
  AlertTriangle,
  Coins,
  Store,
  Plus,
  ArrowUpRight,
  Eye,
  Lock,
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    listings,
    allUsers,
    reports,
    categories,
    currentUser,
    toggleFeatured,
    toggleApproval,
    deleteListing,
    toggleUserSuspension,
    resolveReport,
    addCategory,
    openListingDetail,
    openEditListing,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'stats' | 'listings' | 'users' | 'reports' | 'categories' | 'monetization'
  >('stats');

  // Category addition form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Metrics calculation
  const totalUsers = allUsers.length;
  const totalListings = listings.length;
  const activeListings = listings.filter((l) => l.status === 'Disponible' && l.isApproved).length;
  const soldListings = listings.filter((l) => l.status === 'Vendido').length;
  const pendingReports = reports.filter((r) => r.status === 'pending');
  const featuredListingsCount = listings.filter((l) => l.isFeatured).length;

  // Most used categories
  const categoryCounts: Record<string, number> = {};
  listings.forEach((l) => {
    categoryCounts[l.categoryId] = (categoryCounts[l.categoryId] || 0) + 1;
  });

  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([catId, count]) => {
      const cat = categories.find((c) => c.id === catId);
      return { id: catId, name: cat?.name || catId, count };
    });

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const id = newCatName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '_');
    addCategory({
      id,
      name: newCatName.trim(),
      icon: 'Package',
      description: newCatDesc.trim() || undefined,
    });
    setNewCatName('');
    setNewCatDesc('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Title Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white mb-8 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">Panel de Administración</h1>
                <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow-xs">
                  Oficial
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Control y moderación central de Vende Todo en Hato Mayor
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
            Administrador activo: <strong className="text-white">{currentUser?.name}</strong>
          </div>
        </div>

        {/* Quick Top Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-xs text-slate-400 block">Total Publicaciones</span>
            <span className="text-xl font-black text-white">{totalListings}</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-xs text-slate-400 block">Activas en Hato Mayor</span>
            <span className="text-xl font-black text-emerald-400">{activeListings}</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-xs text-slate-400 block">Artículos Vendidos</span>
            <span className="text-xl font-black text-blue-400">{soldListings}</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-xs text-slate-400 block">Reportes Pendientes</span>
            <span className="text-xl font-black text-rose-400">{pendingReports.length}</span>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2 overflow-x-auto pb-1 text-xs sm:text-sm font-bold">
        {[
          { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
          { id: 'listings', label: `Publicaciones (${totalListings})`, icon: Package },
          { id: 'users', label: `Usuarios y Vendedores (${totalUsers})`, icon: Users },
          { id: 'reports', label: `Reportes (${pendingReports.length})`, icon: Flag },
          { id: 'categories', label: `Categorías (${categories.length})`, icon: Tags },
          { id: 'monetization', label: 'Monetización Futura', icon: Coins },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                isSelected
                  ? 'border-amber-500 text-slate-900 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Estadísticas */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Total de Usuarios Registrados
              </span>
              <span className="text-3xl font-black text-slate-900 mt-2 block">{totalUsers}</span>
              <p className="text-xs text-emerald-600 mt-2 font-medium">
                Vendedores y compradores locales activos
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Publicaciones Destacadas
              </span>
              <span className="text-3xl font-black text-amber-500 mt-2 block">
                {featuredListingsCount}
              </span>
              <p className="text-xs text-slate-500 mt-2">
                Con mayor visibilidad en el inicio
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Tasa de Venta Efectiva
              </span>
              <span className="text-3xl font-black text-emerald-600 mt-2 block">
                {totalListings > 0 ? `${Math.round((soldListings / totalListings) * 100)}%` : '0%'}
              </span>
              <p className="text-xs text-slate-500 mt-2">
                Artículos concretados y marcados como vendidos
              </p>
            </div>
          </div>

          {/* Categorías más utilizadas */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4">
              Categorías con mayor volumen en Hato Mayor
            </h3>
            <div className="space-y-3">
              {sortedCategories.slice(0, 6).map((cat) => (
                <div key={cat.id} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{cat.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-36 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (cat.count / totalListings) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="font-bold text-slate-900 w-8 text-right">
                      {cat.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Publicaciones Management */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold text-slate-900 text-sm">
              Gestión Integral de Publicaciones
            </h3>
            <span className="text-xs text-slate-500">
              Aprobar, destacar, editar o remover publicaciones de usuarios
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {listings.map((item) => (
              <div
                key={item.id}
                className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                {/* Product thumbnail & basic data */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <img
                    src={item.images[0]}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-600 uppercase">
                        {item.categoryId}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">
                        {item.municipality} ({item.sector})
                      </span>
                      {item.isFeatured && (
                        <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                          Destacado
                        </span>
                      )}
                      {!item.isApproved && (
                        <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded">
                          Rechazada
                        </span>
                      )}
                    </div>

                    <h4
                      onClick={() => openListingDetail(item.id)}
                      className="font-bold text-slate-900 text-sm truncate hover:text-emerald-600 cursor-pointer"
                    >
                      {item.title}
                    </h4>

                    <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                      <span className="font-black text-slate-900">
                        {formatRDPrice(item.price)}
                      </span>
                      <span>Por: {item.sellerName}</span>
                      <span>Estado: <strong>{item.status}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Admin controls */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {/* Toggle Approval */}
                  <button
                    onClick={() => toggleApproval(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      item.isApproved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {item.isApproved ? 'Aprobada ✓' : 'Rechazada ✕'}
                  </button>

                  {/* Toggle Feature */}
                  <button
                    onClick={() => toggleFeatured(item.id)}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 ${
                      item.isFeatured
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                    title="Destacar publicación en portada"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">{item.isFeatured ? 'Destacada' : 'Destacar'}</span>
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEditListing(item)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600"
                    title="Editar"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar definitivamente "${item.title}"?`)) {
                        deleteListing(item.id);
                      }
                    }}
                    className="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Usuarios y Vendedores */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">
              Control de Usuarios y Vendedores
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervisión de cuentas registradas en Hato Mayor, suspensión preventiva y roles.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {allUsers.map((u) => {
              const userListingsCount = listings.filter((l) => l.sellerId === u.id).length;
              return (
                <div
                  key={u.id}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-800 font-bold flex items-center justify-center">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{u.name}</h4>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.role}
                        </span>
                        {u.isSuspended && (
                          <span className="text-[10px] bg-rose-500 text-white font-extrabold px-2 py-0.5 rounded">
                            SUSPENDIDO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {u.email} • Tel: {formatPhoneNumber(u.phone)} • {u.sector}, {u.municipality}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                      {userListingsCount} publicaciones
                    </span>

                    {u.role !== 'admin' && (
                      <button
                        onClick={() => toggleUserSuspension(u.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          u.isSuspended
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {u.isSuspended ? 'Reactivar Cuenta' : 'Suspender Usuario'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: Reportes de Publicaciones */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">
              Bandeja de Reportes de Seguridad
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Notificaciones de la comunidad por fraude, productos prohibidos o contenido falso.
            </p>
          </div>

          {reports.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {reports.map((rep) => (
                <div key={rep.id} className="p-6 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-rose-100 text-rose-800">
                        {rep.reason}
                      </span>
                      <span className="text-xs text-slate-500">
                        Estado: <strong>{rep.status.toUpperCase()}</strong>
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatRelativeTime(rep.createdAt)}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Publicación reportada: <em>"{rep.listingTitle}"</em>
                    </h4>
                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1">
                      <strong>Detalles del denunciante:</strong> {rep.details}
                      {rep.reportedByName && ` — por ${rep.reportedByName}`}
                    </p>
                  </div>

                  {rep.status === 'pending' && (
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <button
                        onClick={() => resolveReport(rep.id, 'dismiss')}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                      >
                        Descartar reporte
                      </button>
                      <button
                        onClick={() => resolveReport(rep.id, 'delete_listing')}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
                      >
                        Eliminar publicación infractora
                      </button>
                      <button
                        onClick={() => resolveReport(rep.id, 'suspend_seller')}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                      >
                        Suspender vendedor
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs">
              No hay reportes de seguridad pendientes. ¡La comunidad está limpia!
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Gestión de Categorías */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Category form */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs h-fit">
            <h3 className="font-bold text-slate-900 text-sm mb-1">
              Agregar Nueva Categoría
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Expande la oferta del marketplace según crezcan las necesidades de Hato Mayor.
            </p>

            <form onSubmit={handleAddCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre de la categoría
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ej. Artesanía, Alquileres, Cacao..."
                  required
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descripción opcional
                </label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Breve detalle sobre los artículos incluidos"
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Categoría</span>
              </button>
            </form>
          </div>

          {/* List of active categories */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-4">
              Categorías Activas ({categories.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{c.name}</span>
                    <span className="text-[11px] text-slate-400">{c.id}</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Activa
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Monetización Futura (Preparada según requerimiento) */}
      {activeTab === 'monetization' && (
        <div className="space-y-6">
          <div className="bg-amber-50 rounded-3xl border border-amber-200/80 p-6">
            <h3 className="text-base font-black text-amber-950 flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-600" />
              <span>Arquitectura de Monetización Preparada</span>
            </h3>
            <p className="text-xs text-amber-900 mt-1 leading-relaxed">
              Tal como se solicitó, la publicación básica para particulares en Hato Mayor se mantiene 100% gratuita y sin barreras. Los siguientes módulos de ingresos comerciales están configurados y listos para activar cuando el volumen de usuarios lo requiera:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                ★
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Publicaciones Destacadas</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Permite a los vendedores pagar una tarifa simbólica (ej: RD$ 100 por 7 días) para fijar sus productos en la portada y primeros resultados.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Listo para activar
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Tiendas Oficiales para Negocios</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Planes para ferreterías, tiendas de repuestos, agroveterinarias y boutiques de Hato Mayor con logo personalizado y catálogo ilimitado.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  Estructura preparada
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Banners Patrocinados Locales</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Espacios publicitarios dedicados para bancos, cooperativas locales (ej. Coop-Mamoncito) y empresas de transporte interprovincial.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                  Espacios listos
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
