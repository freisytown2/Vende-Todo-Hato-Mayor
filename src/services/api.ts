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
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });

    if (res.ok) {
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

    // Explicit rejection from server (e.g. wrong password)
    if (res.status === 400 || res.status === 401) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Credenciales incorrectas');
    }
  } catch (netErr: any) {
    // If it was an explicit invalid credentials error, re-throw it
    if (netErr.message === 'Credenciales incorrectas' || netErr.message?.includes('contraseña')) {
      throw netErr;
    }
    console.warn('Backend server /api/auth/login unreachable, using autonomous fallback:', netErr);
  }

  // --- AUTONOMOUS FALLBACK (Runs on exported static builds, Vercel, Netlify, or offline) ---
  const cleanEmail = email.trim().toLowerCase();

  // 1. Super Admin credentials check
  if (cleanEmail === 'viralatoa@gmail.com' && pass === 'Lamano09@') {
    const adminUser: User = {
      id: 'usr_admin_master',
      name: 'Super Admin Hato Mayor',
      email: cleanEmail,
      phone: '809-553-2000',
      role: 'admin',
      userType: 'seller',
      sector: 'Centro de Hato Mayor',
      municipality: 'Hato Mayor del Rey',
      joinedDate: '2026-01-01T00:00:00.000Z',
      favorites: [],
      isSuspended: false,
    };
    saveAdminToken('adm_static_fallback_token');
    return { user: adminUser, adminToken: 'adm_static_fallback_token', isAdmin: true };
  }

  // 2. Check local registered users
  try {
    const usersStr = localStorage.getItem('vende_todo_hm_users');
    const localUsers: User[] = usersStr ? JSON.parse(usersStr) : [];
    const found = localUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (found) {
      return { user: found, isAdmin: found.role === 'admin' };
    }
  } catch {}

  throw new Error('Credenciales incorrectas o usuario no encontrado');
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
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      removeAdminToken();
      return { user: data.user };
    }

    if (res.status === 400) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al crear la cuenta');
    }
  } catch (netErr: any) {
    if (netErr.message?.includes('registrado') || netErr.message?.includes('contraseña')) {
      throw netErr;
    }
    console.warn('Backend server /api/auth/register unreachable, using autonomous fallback:', netErr);
  }

  // Autonomous fallback for exported static apps
  const cleanEmail = payload.email.trim().toLowerCase();
  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: payload.name.trim(),
    email: cleanEmail,
    phone: payload.phone.trim(),
    sector: payload.sector,
    municipality: payload.municipality,
    role: cleanEmail === 'viralatoa@gmail.com' ? 'admin' : 'user',
    userType: payload.userType || 'seller',
    joinedDate: new Date().toISOString(),
    favorites: [],
    isSuspended: false,
  };

  removeAdminToken();
  return { user: newUser };
}

export async function upgradeToSellerApi(userId: string): Promise<User> {
  try {
    const res = await fetch('/api/auth/upgrade-to-seller', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
  } catch (netErr) {
    console.warn('Backend upgrade-to-seller unreachable, using client fallback:', netErr);
  }

  // Fallback for exported apps
  const savedUserStr = localStorage.getItem('vende_todo_hm_active_user');
  if (savedUserStr) {
    const parsed = JSON.parse(savedUserStr);
    return { ...parsed, userType: 'seller', isSuspended: false };
  }
  return {
    id: userId,
    name: 'Vendedor',
    email: '',
    phone: '',
    sector: '',
    municipality: 'Hato Mayor del Rey',
    userType: 'seller',
    role: 'user',
    joinedDate: new Date().toISOString(),
    favorites: [],
    isSuspended: false,
  };
}

// 1. Fetch all public listings from shared backend
export async function fetchAllListings(): Promise<Listing[]> {
  try {
    const res = await fetch('/api/listings');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('Backend fetchAllListings notice:', err);
    return [];
  }
}

// 1.1 Fetch single listing by ID from backend
export async function fetchSingleListing(id: string): Promise<Listing | null> {
  try {
    const res = await fetch(`/api/listings/${id}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Could not fetch single listing from /api/listings/:id', err);
  }
  return null;
}

// 1.2 Sync and merge client or Firestore listings with the backend server cache
export async function syncListingsWithBackend(listings: Listing[]): Promise<Listing[]> {
  try {
    if (!listings || listings.length === 0) return [];
    const res = await fetch('/api/listings/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listings),
    });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data.listings) ? data.listings : [];
    }
  } catch (err) {
    console.warn('Backend sync notice:', err);
  }
  return [];
}

// 2. Create listing on shared server (instantly shared with all users)
export async function createSharedListing(
  listingData: Omit<Listing, 'createdAt' | 'views' | 'isApproved' | 'sellerId' | 'sellerName' | 'sellerJoinedDate'> & {
    id?: string;
    sellerName?: string;
    sellerId?: string;
    sellerJoinedDate?: string;
  }
): Promise<{ listing: Listing; sellerToken: string }> {
  try {
    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listingData),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.sellerToken && result.listing?.id) {
        saveSellerToken(result.listing.id, result.sellerToken);
      }
      return {
        listing: result.listing,
        sellerToken: result.sellerToken,
      };
    }
  } catch (err) {
    console.warn('Backend server unreachable, listing managed via Firestore:', err);
  }

  // Autonomous fallback for exported static apps
  const finalId = listingData.id || `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const fallbackToken = `tok_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  saveSellerToken(finalId, fallbackToken);

  const fallbackListing: Listing = {
    ...listingData,
    id: finalId,
    sellerName: listingData.sellerName || 'Vendedor Hato Mayor',
    sellerId: listingData.sellerId || 'unknown',
    sellerJoinedDate: listingData.sellerJoinedDate || new Date().toISOString(),
    createdAt: new Date().toISOString(),
    views: 1,
    isApproved: true,
  };

  return {
    listing: fallbackListing,
    sellerToken: fallbackToken,
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

  try {
    const res = await fetch(`/api/listings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-seller-token': token,
        'x-admin-token': adminToken,
      },
      body: JSON.stringify(updatedFields),
    });

    if (res.ok) {
      const result = await res.json();
      return result.listing;
    }
  } catch (err) {
    console.warn('Backend server unreachable during update, Firestore handles sync:', err);
  }

  return { id, ...updatedFields } as Listing;
}

// 4. Delete listing (protected by sellerToken or adminToken)
export async function deleteSharedListing(id: string): Promise<void> {
  const tokens = getStoredSellerTokens();
  const token = tokens[id] || '';
  const adminToken = getAdminToken();

  try {
    const res = await fetch(`/api/listings/${id}`, {
      method: 'DELETE',
      headers: {
        'x-seller-token': token,
        'x-admin-token': adminToken,
      },
    });
    if (res.ok) {
      removeSellerToken(id);
      return;
    }
  } catch (err) {
    console.warn('Backend server unreachable during delete, Firestore handles sync:', err);
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

  try {
    const res = await fetch(`/api/listings/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-seller-token': token,
        'x-admin-token': adminToken,
      },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      const result = await res.json();
      return result.listing;
    }
  } catch (err) {
    console.warn('Backend server unreachable during status change, Firestore handles sync:', err);
  }

  return { id, status } as Listing;
}

// 6. Record view count
export async function recordListingView(id: string): Promise<void> {
  try {
    await fetch(`/api/listings/${id}/view`, { method: 'POST' });
  } catch {
    // Non-blocking
  }
}
