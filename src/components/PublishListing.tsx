import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ItemCondition, MeetingPlaceType } from '../types';
import { compressImage } from '../utils/imageCompressor';
import { MUNICIPALITIES } from '../data/initialData';
import {
  Upload,
  X,
  Plus,
  Image as ImageIcon,
  ShieldAlert,
  ShieldCheck,
  Store,
  Home,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';

export const PublishListing: React.FC = () => {
  const {
    categories,
    currentUser,
    addListing,
    updateListing,
    editingListing,
    setActiveView,
    showToast,
  } = useApp();

  const isEditing = Boolean(editingListing);

  // Form states
  const [title, setTitle] = useState(editingListing?.title || '');
  const [description, setDescription] = useState(editingListing?.description || '');
  const [price, setPrice] = useState(editingListing ? String(editingListing.price) : '');
  const [categoryId, setCategoryId] = useState(editingListing?.categoryId || 'motor');
  const [condition, setCondition] = useState<ItemCondition>(editingListing?.condition || 'Usado');
  const [phone, setPhone] = useState(editingListing?.phone || currentUser?.phone || '');
  const [whatsapp, setWhatsapp] = useState(editingListing?.whatsapp || currentUser?.phone || '');
  const [municipality, setMunicipality] = useState(
    editingListing?.municipality || currentUser?.municipality || 'Hato Mayor del Rey'
  );
  const [sector, setSector] = useState(
    editingListing?.sector || currentUser?.sector || 'Las Malvinas'
  );
  const [meetingPlaceType, setMeetingPlaceType] = useState<MeetingPlaceType>(
    editingListing?.meetingPlaceType || 'public'
  );
  const [meetingPlaceDetails, setMeetingPlaceDetails] = useState(
    editingListing?.meetingPlaceDetails || 'Parque Central Mercedes de la Rocha'
  );

  // Images list (Base64 data urls or remote urls)
  const [images, setImages] = useState<string[]>(
    editingListing?.images || [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=80',
    ]
  );
  const [isCompressing, setIsCompressing] = useState(false);

  // Sectors for selected municipality
  const activeSectors =
    MUNICIPALITIES.find((m) => m.name === municipality)?.sectors || MUNICIPALITIES[0].sectors;

  // Sync sector if municipality changes
  useEffect(() => {
    if (!activeSectors.includes(sector)) {
      setSector(activeSectors[0]);
    }
  }, [municipality, activeSectors, sector]);

  // Handle image upload from file input
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    try {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        if (images.length + newImages.length >= 8) {
          showToast('Máximo 8 fotos por publicación');
          break;
        }
        const compressed = await compressImage(files[i]);
        newImages.push(compressed);
      }
      setImages((prev) => [...prev, ...newImages]);
      showToast(`${newImages.length} foto(s) agregada(s) con éxito`);
    } catch (err) {
      console.error(err);
      showToast('Error al optimizar la imagen');
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const setAsPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      return [selected, ...copy];
    });
    showToast('Foto principal actualizada');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Por favor escribe el título del artículo');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      showToast('Ingresa un precio válido en pesos dominicanos (RD$)');
      return;
    }
    if (!description.trim()) {
      showToast('Por favor escribe una descripción para tu artículo');
      return;
    }
    if (!phone.trim()) {
      showToast('El teléfono de contacto es requerido');
      return;
    }
    if (images.length === 0) {
      showToast('Agrega al menos una fotografía del artículo');
      return;
    }

    if (isEditing && editingListing) {
      updateListing(editingListing.id, {
        title: title.trim(),
        description: description.trim(),
        price: numPrice,
        categoryId,
        condition,
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        municipality,
        sector,
        meetingPlaceType,
        meetingPlaceDetails: meetingPlaceDetails.trim(),
        images,
      });
      setActiveView('listing-detail');
    } else {
      addListing({
        title: title.trim(),
        description: description.trim(),
        price: numPrice,
        categoryId,
        condition,
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        province: 'Hato Mayor',
        municipality,
        sector,
        meetingPlaceType,
        meetingPlaceDetails: meetingPlaceDetails.trim(),
        status: 'Disponible',
        images,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setActiveView('home')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancelar y volver</span>
        </button>
        <span className="text-xs text-slate-400">
          Vendedor: <strong className="text-slate-800">{currentUser?.name}</strong>
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10">
        <div className="border-b border-slate-100 pb-6 mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isEditing ? 'Editar Publicación' : 'Publicar un Artículo'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Llega a compradores en Hato Mayor del Rey, El Valle y Sabana de la Mar de forma rápida y segura.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Photos Upload Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-slate-900">
                Fotografías del artículo <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400">
                {images.length}/8 fotos (La primera es la foto principal)
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Sube fotos claras con buena iluminación. Nuestro sistema optimiza las imágenes automáticamente para carga rápida.
            </p>

            {/* Grid of uploaded images + upload button */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-2 group bg-slate-100 ${
                    idx === 0 ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />

                  {/* Primary badge */}
                  {idx === 0 ? (
                    <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm">
                      Principal
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAsPrimaryImage(idx)}
                      className="absolute bottom-2 left-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white text-[10px] font-semibold py-1 rounded text-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Hacer principal
                    </button>
                  )}

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 shadow-sm"
                    title="Eliminar foto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Upload trigger card */}
              {images.length < 8 && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 flex flex-col items-center justify-center cursor-pointer transition-all p-4 text-center group">
                  <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-600 flex items-center justify-center mb-2 transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-700">
                    {isCompressing ? 'Optimizando...' : 'Subir foto'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">JPG o PNG</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={isCompressing}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wider">
                Nombre o título del artículo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Motor CG 200 Tauro 2023, iPhone 13, Cama Queen..."
                maxLength={90}
                required
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wider">
                Categoría <span className="text-rose-500">*</span>
              </label>
              <select
                aria-label="Seleccionar categoría"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wider">
                Precio en Pesos Dominicanos (RD$) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-black text-emerald-600">
                  RD$
                </span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="25000"
                  min="0"
                  step="1"
                  required
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl pl-13 pr-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wider">
                Condición del artículo <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Nuevo', 'Como nuevo', 'Usado'] as ItemCondition[]).map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setCondition(cond)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      condition === cond
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wider">
              Descripción detallada <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Explica detalles como estado físico, tiempo de uso, si tiene papeles, motivo de venta, qué incluye..."
              required
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
            />
          </div>

          {/* Contact Numbers: Phone and WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wider">
                Teléfono de contacto para llamadas <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. 8095530000 ó 829..."
                required
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wider">
                Número de WhatsApp (mensajes directos)
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ej. 8296458890"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Approximate Location (Municipality & Sector) */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900">
                Ubicación general en la provincia
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Solo se mostrará el municipio y sector general (ej: "Hato Mayor del Rey, sector Las Malvinas"). <strong>Tu dirección exacta nunca se publicará.</strong>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Municipio
                </label>
                <select
                  aria-label="Seleccionar municipio para la publicación"
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {MUNICIPALITIES.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sector o Comunidad
                </label>
                <select
                  aria-label="Seleccionar sector o comunidad para la publicación"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {activeSectors.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Delivery or Meeting Place (Crucial Feature Requested by User) */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>¿Dónde se realizará la entrega o el encuentro?</span>
                <span className="text-rose-500">*</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Selecciona la opción que garantice la mayor seguridad y comodidad para ambas partes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'public' as MeetingPlaceType,
                  title: '1. Lugar público',
                  desc: 'Recomendado. Parque, plaza, frente a banco o estación.',
                  icon: ShieldCheck,
                },
                {
                  id: 'business' as MeetingPlaceType,
                  title: '2. En un negocio',
                  desc: 'Local comercial, tienda o negocio verificado.',
                  icon: Store,
                },
                {
                  id: 'home' as MeetingPlaceType,
                  title: '3. En la casa del vendedor',
                  desc: 'Artículos pesados o de mudanza. Dirección privada.',
                  icon: Home,
                },
                {
                  id: 'other' as MeetingPlaceType,
                  title: '4. Otro lugar acordado',
                  desc: 'Punto mutuo a coordinar por WhatsApp.',
                  icon: MapPin,
                },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = meetingPlaceType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMeetingPlaceType(opt.id)}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white/80 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{opt.title}</span>
                      <span className="text-[11px] text-slate-500 leading-tight">{opt.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Dynamic input according to meeting choice */}
            {meetingPlaceType === 'public' && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Lugar público de encuentro sugerido:
                </label>
                <input
                  type="text"
                  value={meetingPlaceDetails}
                  onChange={(e) => setMeetingPlaceDetails(e.target.value)}
                  placeholder="Ej: Parque Central Mercedes de la Rocha, Supermercado Iberia..."
                  required
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            )}

            {meetingPlaceType === 'business' && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Nombre del negocio y ubicación:
                </label>
                <input
                  type="text"
                  value={meetingPlaceDetails}
                  onChange={(e) => setMeetingPlaceDetails(e.target.value)}
                  placeholder="Ej: Colmado El Campesino (Calle Duarte frente a farmacia)..."
                  required
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            )}

            {meetingPlaceType === 'home' && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Aviso Importante de Seguridad y Privacidad:</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Por tu seguridad, <strong>NO publiques tu dirección residencial exacta</strong> en este campo. Solo escribe indicaciones generales (ej. "Cerca de la Escuela de Las Malvinas"). La dirección exacta solo debes compartirla por WhatsApp o llamada cuando confirmes la seriedad del comprador.
                </p>
                <input
                  type="text"
                  value={meetingPlaceDetails}
                  onChange={(e) => setMeetingPlaceDetails(e.target.value)}
                  placeholder="Ej: Referencia general en Las Malvinas (coordinar por llamada)"
                  required
                  className="w-full text-xs bg-white border border-amber-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            {meetingPlaceType === 'other' && (
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Descripción del punto de entrega:
                </label>
                <input
                  type="text"
                  value={meetingPlaceDetails}
                  onChange={(e) => setMeetingPlaceDetails(e.target.value)}
                  placeholder="Ej: Entrega a domicilio en Hato Mayor del Rey o punto a acordar..."
                  required
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            )}
          </div>

          {/* Submit CTA */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveView('home')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCompressing}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer"
            >
              {isEditing ? 'Guardar Cambios' : 'Publicar Artículo Ahora'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
