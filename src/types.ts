export type ItemCondition = 'Nuevo' | 'Como nuevo' | 'Usado';

export type ItemStatus = 'Disponible' | 'Reservado' | 'Vendido';

export type MeetingPlaceType = 'public' | 'business' | 'home' | 'other';

export type ReportReason =
  | 'Producto prohibido'
  | 'Estafa o posible fraude'
  | 'Información falsa'
  | 'Publicación duplicada'
  | 'Contenido ofensivo'
  | 'Otro';

export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  condition: ItemCondition;
  images: string[]; // Primary image is images[0]
  phone: string;
  whatsapp: string;
  province: string; // e.g. "Hato Mayor"
  municipality: string; // e.g. "Hato Mayor del Rey", "El Valle", "Sabana de la Mar"
  sector: string; // e.g. "Las Malvinas", "Villa Canto", "Centro"
  meetingPlaceType: MeetingPlaceType;
  meetingPlaceDetails: string;
  status: ItemStatus;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerJoinedDate: string;
  createdAt: string;
  views: number;
  isFeatured?: boolean;
  isApproved: boolean;
  updatedAt?: string;
  sellerRole?: 'seller' | 'buyer';
}

export type UserType = 'seller' | 'buyer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  sector: string;
  municipality: string;
  avatar?: string;
  userType: UserType; // 'seller' = puede publicar y gestionar | 'buyer' = explora, busca y contacta
  role: 'user' | 'admin';
  isSuspended: boolean;
  joinedDate: string;
  favorites: string[];
}

export interface Report {
  id: string;
  listingId: string;
  listingTitle: string;
  sellerId: string;
  reportedByName?: string;
  reportedByPhone?: string;
  reason: ReportReason;
  details: string;
  createdAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface BuyerContactLog {
  id: string;
  listingId: string;
  listingTitle: string;
  buyerName: string;
  buyerPhone: string;
  buyerMessage: string;
  sellerId: string;
  channel: 'whatsapp' | 'call' | 'in_app';
  createdAt: string;
}

export interface FilterState {
  searchQuery: string;
  categoryId: string;
  minPrice: string;
  maxPrice: string;
  condition: string;
  municipality: string;
  sector: string;
  meetingPlaceType: string;
  sortBy: 'recent' | 'price_asc' | 'price_desc';
}
