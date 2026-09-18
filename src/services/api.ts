import { Listing, ItemStatus, User } from '../types';

const TOKENS_KEY = 'vende_todo_seller_tokens';
const ADMIN_TOKEN_KEY = 'vende_todo_admin_token';

// Retrieve stored seller tokens from localStorage
export function getStoredSellerTokens(): Record<string, string> {
  try {
    const saved = localStorage.getItem(TOKENS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

// Admin Token management (when Super Admin logs in)
export function getAdminToken(): string {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function saveAdminToken(token: string) {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch (err) {
    console.error('Error saving admin token:', err);
  }
}

export function removeAdminToken() {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch (err) {
    console.error('Error removing admin token:', err);
  }
}

// Store a newly received seller token
export function saveSellerToken(listingId: string, token: string) {
  try {
    const tokens = getStoredSellerTokens();
    tokens[listingId] = token;
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  } catch (err) {
    console.error('Error saving seller token:', err);
  }
}

// Remove token if item is deleted
export function removeSellerToken(listingId: string) {
  try {
    const tokens = getStoredSellerTokens();
    delete tokens[listingId];
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  } catch (err) {
    console.error('Error removing seller token:', err);
  }
}

// Check if current browser has the seller token for a listing
export function hasSellerTokenFor(listingId: string): boolean {
  const tokens = getStoredSellerTokens();
  return Boolean(tokens[listingId]);
}

// --- AUTHENTICATION CALLS ---
export async function loginUser(
  email: string,
  pass: string
): Promise<{ user: User; adminToken?: string; isAdmin?: boolean }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: pass }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Credenciales incorrectas');
  }

  const data = await res.json();
  if (data.adminToken) {
    saveAdminToken(data.adminToken);
  } else {
    removeAdminToken();
  }

  return {
    user: data.user,
    adminToken: data.adminToken,
    isAdmin: Boolean(data.isAdmin),
  };
}

export async function registerUser(payload: {
  name: string;
  email: string;
  phone: string;
  sector: string;
  municipality: string;
  password: string;
  userType?: 'seller' | 'buyer';
}): Promise<{ user: User }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al crear la cuenta');
  }

  const data = await res.json();
  removeAdminToken();
  return { user: data.user };
}

export async function upgradeToSellerApi(userId: string): Promise<User> {
  const res = await fetch('/api/auth/upgrade-to-seller', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al actualizar a cuenta de vendedor');
  }

  const data = await res.json();
  return data.user;
}

// 1. Fetch all public listings from shared backend
export async function fetchAllListings(): Promise<Listing[]> {
  try {
    const res = await fetch('/api/listings');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('Fallback: could not fetch from /api/listings, checking local cache', err);
    try {
      const cached = localStorage.getItem('vende_todo_hm_listings');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }
}

// 2. Create listing on shared server (instantly shared with all users)
export async function createSharedListing(
  listingData: Omit<Listing, 'id' | 'createdAt' | 'views' | 'isApproved' | 'sellerId' | 'sellerName' | 'sellerJoinedDate'> & {
    sellerName?: string;
    sellerId?: string;
    sellerJoinedDate?: string;
  }
): Promise<{ listing: Listing; sellerToken: string }> {
  const res = await fetch('/api/listings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(listingData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al publicar artículo en el servidor');
  }

  const result = await res.json();
  if (result.sellerToken && result.listing?.id) {
    saveSellerToken(result.listing.id, result.sellerToken);
  }

  return {
    listing: result.listing,
    sellerToken: result.sellerToken,
  };
}

// 3. Update listing (protected by sellerToken or adminToken)
export async function updateSharedListing(
  id: string,
  updatedFields: Partial<Listing>
): Promise<Listing> {
  const tokens = getStoredSellerTokens();
  const token = tokens[id] || '';
  const adminToken = getAdminToken();

  const res = await fetch(`/api/listings/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-seller-token': token,
      'x-admin-token': adminToken,
    },
    body: JSON.stringify(updatedFields),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'No tienes permiso para modificar esta publicación');
  }

  const result = await res.json();
  return result.listing;
}

// 4. Delete listing (protected by sellerToken or adminToken)
export async function deleteSharedListing(id: string): Promise<void> {
  const tokens = getStoredSellerTokens();
  const token = tokens[id] || '';
  const adminToken = getAdminToken();

  const res = await fetch(`/api/listings/${id}`, {
    method: 'DELETE',
    headers: {
      'x-seller-token': token,
      'x-admin-token': adminToken,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'No tienes permiso para eliminar esta publicación');
  }

  removeSellerToken(id);
}

// 5. Change listing status (Disponible, Reservado, Vendido)
export async function changeSharedListingStatus(
  id: string,
  status: ItemStatus
): Promise<Listing> {
  const tokens = getStoredSellerTokens();
  const token = tokens[id] || '';
  const adminToken = getAdminToken();

  const res = await fetch(`/api/listings/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-seller-token': token,
      'x-admin-token': adminToken,
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'No tienes permiso para cambiar el estado');
  }

  const result = await res.json();
  return result.listing;
}

// 6. Record view count
export async function recordListingView(id: string): Promise<void> {
  try {
    await fetch(`/api/listings/${id}/view`, { method: 'POST' });
  } catch {
    // Non-blocking
  }
}
