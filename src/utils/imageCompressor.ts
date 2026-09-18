/**
 * Image compressor using HTML5 Canvas
 * Resizes large photos uploaded by users to reasonable dimensions (max 1200px)
 * and JPEG compression (0.8 quality) to prevent storage bloat and ensure fast loading.
 */

export async function compressImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Format currency in Dominican Pesos (RD$)
 */
export function formatRDPrice(price: number): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price).replace('DOP', 'RD$');
}

/**
 * Clean and format Dominican telephone or WhatsApp number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Build WhatsApp click-to-chat URL with automated message
 */
export function getWhatsAppUrl(phone: string, itemTitle: string): string {
  let cleaned = phone.replace(/\D/g, '');
  // If 10 digits (e.g. 809..., 829..., 849...), prefix Dominican country code '1'
  if (cleaned.length === 10) {
    cleaned = '1' + cleaned;
  }
  const message = `Hola, vi tu publicación en Vende Todo en Hato Mayor y estoy interesado en "${itemTitle}". ¿Aún está disponible?`;
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

/**
 * Format relative Dominican time
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 2) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours === 1) return 'Hace 1 hora';
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return 'Reciente';
  }
}
