import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const rootDir = process.cwd();

// High payload limit to allow mobile photo uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Ensure data directory exists
const DATA_DIR = path.join(rootDir, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const LISTINGS_FILE = path.join(DATA_DIR, 'listings.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Super Admin configuration (kept securely server-side)
const MASTER_ADMIN_EMAIL = 'viralatoa@gmail.com';
const MASTER_ADMIN_PASS = 'Lamano09@';
const ADMIN_SECRET = 'hm_super_secret_salt_2026_hato_mayor';

function generateAdminToken(): string {
  const timestamp = Date.now().toString();
  const hmac = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(`${MASTER_ADMIN_EMAIL}:${timestamp}`)
    .digest('hex');
  return `adm_${timestamp}_${hmac}`;
}

function isValidAdminToken(token: string): boolean {
  if (!token || !token.startsWith('adm_')) return false;
  const parts = token.split('_');
  if (parts.length !== 3) return false;
  const timestamp = parts[1];
  const expectedHmac = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(`${MASTER_ADMIN_EMAIL}:${timestamp}`)
    .digest('hex');
  return parts[2] === expectedHmac;
}

// Stored user model
interface StoredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  sector: string;
  municipality: string;
  userType: 'seller' | 'buyer';
  role: 'user' | 'admin';
  salt: string;
  hash: string;
  isSuspended: boolean;
  joinedDate: string;
  favorites: string[];
}

function loadUsers(): StoredUser[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const content = fs.readFileSync(USERS_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.error('Error loading users:', err);
  }
  return [];
}

function saveUsers(users: StoredUser[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users:', err);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha256').toString('hex');
}

// Interface for listing with server-side security token
interface ServerListing {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  condition: string;
  images: string[];
  phone: string;
  whatsapp?: string;
  province: string;
  municipality: string;
  sector: string;
  meetingPlaceType: string;
  meetingPlaceDetails?: string;
  status: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerJoinedDate: string;
  createdAt: string;
  updatedAt?: string;
  views: number;
  isFeatured: boolean;
  isApproved: boolean;
  sellerToken: string; // Secret token given ONLY to the author
}

// In-memory cache + file sync
let listingsCache: ServerListing[] = [];

function loadListings(): ServerListing[] {
  try {
    if (fs.existsSync(LISTINGS_FILE)) {
      const content = fs.readFileSync(LISTINGS_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        // Filter out any legacy ghost listings just in case
        const ghostIds = ['list_1', 'list_2', 'list_3', 'list_4', 'list_5', 'list_6', 'list_7', 'list_8'];
        listingsCache = data.filter((item: ServerListing) => !ghostIds.includes(item.id));
        return listingsCache;
      }
    }
  } catch (err) {
    console.error('Error loading listings file:', err);
  }
  listingsCache = [];
  return listingsCache;
}

function saveListings() {
  try {
    fs.writeFileSync(LISTINGS_FILE, JSON.stringify(listingsCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving listings file:', err);
  }
}

// Initial load
loadListings();

// SSE (Server-Sent Events) clients for real-time updates across all users
type SSEClient = {
  id: string;
  res: Response;
};
const sseClients: SSEClient[] = [];

function broadcastListingEvent(eventType: 'create' | 'update' | 'delete' | 'status', payload: any) {
  const data = JSON.stringify({ type: eventType, payload });
  for (let i = sseClients.length - 1; i >= 0; i--) {
    const client = sseClients[i];
    try {
      client.res.write(`data: ${data}\n\n`);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

// Helper to strip sellerToken before sending listings to public clients
function toPublicListing(item: ServerListing) {
  const { sellerToken, ...publicData } = item;
  return publicData;
}

// --- API ROUTES ---

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', listingsCount: listingsCache.length, sseClientsCount: sseClients.length });
});

// 2. Real-time Server-Sent Events stream
app.get('/api/listings/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = `client_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  sseClients.push({ id: clientId, res });

  // Send initial ping so client knows connection is alive
  res.write(`data: ${JSON.stringify({ type: 'connected', total: listingsCache.length })}\n\n`);

  req.on('close', () => {
    const index = sseClients.findIndex((c) => c.id === clientId);
    if (index !== -1) {
      sseClients.splice(index, 1);
    }
  });
});

// 3. Get all shared listings (public)
app.get('/api/listings', (req: Request, res: Response) => {
  const publicListings = listingsCache.map(toPublicListing);
  res.json(publicListings);
});

// 3.1 Get single shared listing by ID
app.get('/api/listings/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const item = listingsCache.find((l) => l.id === id);
  if (item) {
    res.json(toPublicListing(item));
  } else {
    res.status(404).json({ error: 'Publicación no encontrada' });
  }
});

// 3.2 Sync / merge collection of listings from Firestore or client cache
app.post('/api/listings/sync', (req: Request, res: Response) => {
  try {
    const incoming = req.body;
    if (Array.isArray(incoming) && incoming.length > 0) {
      let modified = false;
      for (const item of incoming) {
        if (!item || !item.id) continue;
        const ghostIds = ['list_1', 'list_2', 'list_3', 'list_4', 'list_5', 'list_6', 'list_7', 'list_8'];
        if (ghostIds.includes(item.id)) continue;

        const idx = listingsCache.findIndex((l) => l.id === item.id);
        if (idx === -1) {
          listingsCache.push({
            id: item.id,
            title: String(item.title || '').trim(),
            description: String(item.description || '').trim(),
            price: Number(item.price) || 0,
            categoryId: String(item.categoryId || 'otros').trim(),
            condition: String(item.condition || 'Usado').trim(),
            images: Array.isArray(item.images) ? item.images : [],
            phone: String(item.phone || '').trim(),
            whatsapp: String(item.whatsapp || item.phone || '').trim(),
            province: 'Hato Mayor',
            municipality: String(item.municipality || 'Hato Mayor del Rey').trim(),
            sector: String(item.sector || 'Centro').trim(),
            meetingPlaceType: String(item.meetingPlaceType || 'public').trim(),
            meetingPlaceDetails: String(item.meetingPlaceDetails || '').trim(),
            status: item.status || 'Disponible',
            sellerId: String(item.sellerId || 'unknown'),
            sellerName: String(item.sellerName || 'Vendedor Hato Mayor').trim(),
            sellerAvatar: item.sellerAvatar || '',
            sellerJoinedDate: item.sellerJoinedDate || new Date().toISOString(),
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt || new Date().toISOString(),
            views: Number(item.views) || 1,
            isFeatured: Boolean(item.isFeatured),
            isApproved: item.isApproved !== false,
            sellerToken: item.sellerToken || `stk_sync_${Math.random().toString(36).slice(2, 8)}`,
          });
          modified = true;
        } else {
          const existingTime = new Date(listingsCache[idx].updatedAt || listingsCache[idx].createdAt || 0).getTime();
          const incomingTime = new Date(item.updatedAt || item.createdAt || 0).getTime();
          if (incomingTime >= existingTime) {
            listingsCache[idx] = {
              ...listingsCache[idx],
              ...item,
              sellerToken: listingsCache[idx].sellerToken || item.sellerToken,
            };
            modified = true;
          }
        }
      }
      if (modified) {
        listingsCache.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        saveListings();
      }
    }
    res.json({ success: true, count: listingsCache.length, listings: listingsCache.map(toPublicListing) });
  } catch (err) {
    console.error('Error syncing listings:', err);
    res.status(500).json({ error: 'Error al sincronizar publicaciones' });
  }
});

// 4. Create a new listing (shared to everyone in real time)
app.post('/api/listings', (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.title || !data.price || !data.phone) {
      res.status(400).json({ error: 'Faltan campos obligatorios (título, precio, teléfono)' });
      return;
    }

    const id = data.id || `list_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    // Generate secure seller token so ONLY this author can edit or delete this item
    const sellerToken = `stk_${crypto.randomBytes(16).toString('hex')}`;

    const newListing: ServerListing = {
      id,
      title: String(data.title).trim(),
      description: String(data.description || '').trim(),
      price: Number(data.price) || 0,
      categoryId: String(data.categoryId || 'otros').trim(),
      condition: String(data.condition || 'Usado').trim(),
      images: Array.isArray(data.images) ? data.images : [],
      phone: String(data.phone).trim(),
      whatsapp: data.whatsapp ? String(data.whatsapp).trim() : String(data.phone).trim(),
      province: 'Hato Mayor',
      municipality: String(data.municipality || 'Hato Mayor del Rey').trim(),
      sector: String(data.sector || 'Centro').trim(),
      meetingPlaceType: String(data.meetingPlaceType || 'public').trim(),
      meetingPlaceDetails: data.meetingPlaceDetails ? String(data.meetingPlaceDetails).trim() : '',
      status: 'Disponible',
      sellerId: String(data.sellerId || `seller_${Date.now()}`),
      sellerName: String(data.sellerName || 'Vendedor Hato Mayor').trim(),
      sellerAvatar: data.sellerAvatar || '',
      sellerJoinedDate: data.sellerJoinedDate || new Date().toISOString(),
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 1,
      isFeatured: Boolean(data.isFeatured),
      isApproved: true,
      sellerToken,
    };

    // Prepend or update if already present
    const existingIndex = listingsCache.findIndex((l) => l.id === id);
    if (existingIndex !== -1) {
      listingsCache[existingIndex] = {
        ...listingsCache[existingIndex],
        ...newListing,
        sellerToken: listingsCache[existingIndex].sellerToken || sellerToken,
      };
    } else {
      listingsCache.unshift(newListing);
    }
    saveListings();

    const publicListing = toPublicListing(newListing);

    // Broadcast in real-time to all connected users
    broadcastListingEvent('create', publicListing);

    // Return the created listing PLUS the sellerToken to the author so their browser saves it
    res.status(201).json({
      success: true,
      listing: publicListing,
      sellerToken,
    });
  } catch (err: any) {
    console.error('Error creating listing:', err);
    res.status(500).json({ error: 'Error interno al guardar la publicación' });
  }
});

// Helper to verify ownership token or admin authorization
function verifyListingOwnership(req: Request, listing: ServerListing): boolean {
  const tokenHeader = req.headers['x-seller-token'] || req.headers['authorization'];
  const tokenQuery = req.query.sellerToken;
  const tokenBody = req.body?.sellerToken;

  const providedToken =
    (typeof tokenHeader === 'string' ? tokenHeader.replace(/^Bearer\s+/i, '') : '') ||
    (typeof tokenQuery === 'string' ? tokenQuery : '') ||
    (typeof tokenBody === 'string' ? tokenBody : '');

  if (!providedToken) return false;
  return providedToken === listing.sellerToken;
}

// Master authorization check: allows Super Admin OR listing owner
function isAuthorizedToModifyOrDelete(req: Request, listing: ServerListing): boolean {
  // 1. Check if Super Admin token is provided
  const adminHeader = req.headers['x-admin-token'] || req.headers['x-admin-key'];
  const adminToken = typeof adminHeader === 'string' ? adminHeader.replace(/^Bearer\s+/i, '') : '';
  if (adminToken && isValidAdminToken(adminToken)) {
    return true; // Super Admin has universal moderation permissions
  }

  // 2. Check if original author sellerToken is provided
  return verifyListingOwnership(req, listing);
}

// --- AUTHENTICATION ROUTES ---

// Login (handles Super Admin and registered users securely on backend)
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Ingresa correo y contraseña' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPass = String(password);

    // 1. Check Super Admin credentials
    if (cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase() && cleanPass === MASTER_ADMIN_PASS) {
      const adminToken = generateAdminToken();
      const adminUser = {
        id: 'admin_master_viralatoa',
        name: 'Administrador General',
        email: MASTER_ADMIN_EMAIL,
        phone: '8095532020',
        sector: 'Centro de Hato Mayor',
        municipality: 'Hato Mayor del Rey',
        userType: 'seller' as const,
        role: 'admin' as const,
        isSuspended: false,
        joinedDate: '2024-01-01T00:00:00.000Z',
        favorites: [],
      };

      res.json({
        success: true,
        user: adminUser,
        adminToken,
        isAdmin: true,
      });
      return;
    }

    // 2. Check regular registered users
    const users = loadUsers();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      res.status(401).json({ error: 'Correo o contraseña incorrectos' });
      return;
    }

    if (user.isSuspended) {
      res.status(403).json({ error: 'Esta cuenta se encuentra suspendida por infringir normas comunitarias.' });
      return;
    }

    const computedHash = hashPassword(cleanPass, user.salt);
    if (computedHash !== user.hash) {
      res.status(401).json({ error: 'Correo o contraseña incorrectos' });
      return;
    }

    const { salt, hash, ...publicUser } = user;
    res.json({
      success: true,
      user: {
        ...publicUser,
        userType: user.userType || 'seller',
      },
      isAdmin: false,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error del servidor al iniciar sesión' });
  }
});

// Register a new local user
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, phone, sector, municipality, password, userType } = req.body;
    if (!name || !email || !phone || !password) {
      res.status(400).json({ error: 'Completa todos los campos obligatorios' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase()) {
      res.status(400).json({ error: 'Este correo está reservado para la administración' });
      return;
    }

    const users = loadUsers();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      res.status(400).json({ error: 'Ya existe una cuenta registrada con este correo electrónico' });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(String(password), salt);

    const determinedUserType: 'seller' | 'buyer' = userType === 'buyer' ? 'buyer' : 'seller';

    const newUser: StoredUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: String(name).trim(),
      email: cleanEmail,
      phone: String(phone).trim(),
      sector: String(sector || 'Centro de Hato Mayor').trim(),
      municipality: String(municipality || 'Hato Mayor del Rey').trim(),
      userType: determinedUserType,
      role: 'user',
      salt,
      hash,
      isSuspended: false,
      joinedDate: new Date().toISOString(),
      favorites: [],
    };

    users.push(newUser);
    saveUsers(users);

    const { salt: _, hash: __, ...publicUser } = newUser;
    res.status(201).json({
      success: true,
      user: publicUser,
      isAdmin: false,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Upgrade buyer to seller
app.post('/api/auth/upgrade-to-seller', (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ error: 'ID de usuario requerido' });
      return;
    }
    const users = loadUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    users[userIndex].userType = 'seller';
    saveUsers(users);

    const { salt, hash, ...publicUser } = users[userIndex];
    res.json({ success: true, user: publicUser });
  } catch (err) {
    console.error('Error upgrading to seller:', err);
    res.status(500).json({ error: 'Error al actualizar cuenta' });
  }
});

// 5. Update a listing (Author or Super Admin)
app.put('/api/listings/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = listingsCache.findIndex((item) => item.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Publicación no encontrada' });
    return;
  }

  const existing = listingsCache[index];

  if (!isAuthorizedToModifyOrDelete(req, existing)) {
    res.status(403).json({
      error: 'No tienes permiso para modificar esta publicación.',
    });
    return;
  }

  const updates = req.body;
  const updatedListing: ServerListing = {
    ...existing,
    title: updates.title !== undefined ? String(updates.title).trim() : existing.title,
    description: updates.description !== undefined ? String(updates.description).trim() : existing.description,
    price: updates.price !== undefined ? Number(updates.price) : existing.price,
    categoryId: updates.categoryId !== undefined ? String(updates.categoryId) : existing.categoryId,
    condition: updates.condition !== undefined ? String(updates.condition) : existing.condition,
    images: Array.isArray(updates.images) ? updates.images : existing.images,
    phone: updates.phone !== undefined ? String(updates.phone).trim() : existing.phone,
    whatsapp: updates.whatsapp !== undefined ? String(updates.whatsapp).trim() : existing.whatsapp,
    municipality: updates.municipality !== undefined ? String(updates.municipality) : existing.municipality,
    sector: updates.sector !== undefined ? String(updates.sector) : existing.sector,
    meetingPlaceType: updates.meetingPlaceType !== undefined ? String(updates.meetingPlaceType) : existing.meetingPlaceType,
    meetingPlaceDetails: updates.meetingPlaceDetails !== undefined ? String(updates.meetingPlaceDetails) : existing.meetingPlaceDetails,
    sellerName: updates.sellerName !== undefined ? String(updates.sellerName).trim() : existing.sellerName,
  };

  listingsCache[index] = updatedListing;
  saveListings();

  const publicListing = toPublicListing(updatedListing);
  broadcastListingEvent('update', publicListing);

  res.json({ success: true, listing: publicListing });
});

// 6. Delete a listing (Author or Super Admin - allows master deletion)
app.delete('/api/listings/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = listingsCache.findIndex((item) => item.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Publicación no encontrada' });
    return;
  }

  const existing = listingsCache[index];

  if (!isAuthorizedToModifyOrDelete(req, existing)) {
    res.status(403).json({
      error: 'No tienes permiso para eliminar esta publicación. Solo el propietario o el Administrador General pueden eliminarla.',
    });
    return;
  }

  listingsCache.splice(index, 1);
  saveListings();

  broadcastListingEvent('delete', { id });

  res.json({ success: true, id });
});

// 7. Change listing status (Author or Super Admin)
app.patch('/api/listings/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const index = listingsCache.findIndex((item) => item.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Publicación no encontrada' });
    return;
  }

  const existing = listingsCache[index];
  if (!isAuthorizedToModifyOrDelete(req, existing)) {
    res.status(403).json({
      error: 'No tienes permiso para cambiar el estado de este artículo.',
    });
    return;
  }

  existing.status = status;
  listingsCache[index] = existing;
  saveListings();

  const publicListing = toPublicListing(existing);
  broadcastListingEvent('status', publicListing);

  res.json({ success: true, listing: publicListing });
});

// 8. Track view count
app.post('/api/listings/:id/view', (req: Request, res: Response) => {
  const { id } = req.params;
  const item = listingsCache.find((l) => l.id === id);
  if (item) {
    item.views = (item.views || 0) + 1;
    res.json({ success: true, views: item.views });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// --- SEO & SEARCH ENGINE INDEXING ---

// Dynamic sitemap for Google Search and other crawlers
app.get('/sitemap.xml', (req: Request, res: Response) => {
  const baseUrl = `https://${req.get('host') || 'vendetodohatomayor.do'}`;
  const now = new Date().toISOString().split('T')[0];

  const categories = ['motor', 'celulares', 'vehiculos', 'electrodomesticos', 'computadoras', 'muebles', 'hogar', 'ropa', 'terrenos', 'agricultura', 'herramientas', 'deportes', 'ninos', 'animales', 'servicios', 'empleos', 'otros'];

  let urls = `
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

  for (const cat of categories) {
    urls += `
  <url>
    <loc>${baseUrl}/?category=${cat}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  for (const listing of listingsCache) {
    const itemDate = (listing.createdAt ? new Date(listing.createdAt) : new Date()).toISOString().split('T')[0];
    urls += `
  <url>
    <loc>${baseUrl}/#item=${listing.id}</loc>
    <lastmod>${itemDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.send(sitemapXml);
});

// Robots.txt for Googlebot and search crawlers
app.get('/robots.txt', (req: Request, res: Response) => {
  const baseUrl = `https://${req.get('host') || 'vendetodohatomayor.do'}`;
  const robots = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.setHeader('Content-Type', 'text/plain');
  res.send(robots);
});

// Dynamic OpenGraph / Social preview route for WhatsApp, Facebook, and Twitter crawlers
app.get(['/producto/:id', '/item/:id'], (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('user-agent') || '';
  const isCrawler = /facebookexternalhit|WhatsApp|Twitterbot|Pinterest|LinkedInBot|TelegramBot|Slackbot|Googlebot/i.test(userAgent);
  
  if (isCrawler) {
    const { id } = req.params;
    const listing = listingsCache.find((l) => l.id === id);
    if (listing) {
      const priceFormatted = new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', maximumFractionDigits: 0 }).format(listing.price);
      const title = `${listing.title} - ${priceFormatted} | Vende Todo Hato Mayor`;
      const desc = `${listing.description.slice(0, 150)}... Publicado en Hato Mayor del Rey por ${listing.sellerName}.`;
      const image = listing.images && listing.images.length > 0 ? listing.images[0] : 'https://vendetodoenhatomayor.live/og-image.jpg';
      const url = `https://${req.get('host') || 'vendetodoenhatomayor.live'}/producto/${listing.id}`;

      const crawlerHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${image}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${image}">
  <meta http-equiv="refresh" content="0;url=/producto/${listing.id}">
</head>
<body>
  <h1>${title}</h1>
  <p>${desc}</p>
  <img src="${image}" alt="${listing.title}">
</body>
</html>`;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(crawlerHtml);
      return;
    }
  }
  next();
});

// --- VITE / STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Vende Todo Hato Mayor] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
