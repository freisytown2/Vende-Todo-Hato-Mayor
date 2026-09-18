import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Listing,
  Category,
  User,
  Report,
  BuyerContactLog,
  FilterState,
  ItemStatus,
  ReportReason,
} from '../types';
import { INITIAL_CATEGORIES, INITIAL_LISTINGS, INITIAL_USERS } from '../data/initialData';
import {
  fetchAllListings,
  createSharedListing,
  updateSharedListing,
  deleteSharedListing,
  changeSharedListingStatus,
  hasSellerTokenFor,
  recordListingView,
  loginUser,
  registerUser,
  removeAdminToken,
  upgradeToSellerApi,
} from '../services/api';
import {
  subscribeToListings,
  saveListingToFirestore,
  deleteListingFromFirestore,
  updateListingStatusInFirestore,
  saveUserToFirestore,
} from '../services/firebase';

export type AppView =
  | 'home'
  | 'search'
  | 'listing-detail'
  | 'publish'
  | 'edit-listing'
  | 'seller-profile'
  | 'user-dashboard'
  | 'admin-panel'
  | 'favorites';

interface AppContextType {
  // State
  listings: Listing[];
  categories: Category[];
  currentUser: User | null;
  allUsers: User[];
  reports: Report[];
  buyerContacts: BuyerContactLog[];
  filters: FilterState;
  activeView: AppView;
  selectedListingId: string | null;
  selectedSellerId: string | null;
  editingListing: Listing | null;
  
  // Modals state
  isAuthModalOpen: boolean;
  authMode: 'login' | 'register';
  authModalTab: 'login' | 'register' | null;
  isShareModalOpen: boolean;
  activeShareListing: Listing | null;
  isReportModalOpen: boolean;
  activeReportListing: Listing | null;
  toastMessage: string | null;
  intendedActionAfterAuth: 'publish' | null;

  // View & Nav Setters
  setActiveView: (view: AppView) => void;
  openListingDetail: (id: string) => void;
  openSellerProfile: (sellerId: string) => void;
  openPublishModal: () => void;
  openEditListing: (listing: Listing) => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (categoryId: string) => void;

  // Modals triggers
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  openShareModal: (listing: Listing) => void;
  closeShareModal: () => void;
  openReportModal: (listing: Listing) => void;
  closeReportModal: () => void;
  showToast: (msg: string) => void;

  // Marketplace operations
  addListing: (newListing: Omit<Listing, 'id' | 'createdAt' | 'views' | 'isApproved' | 'sellerId' | 'sellerName' | 'sellerJoinedDate'> & { sellerName?: string }) => string;
  updateListing: (id: string, updatedFields: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  changeListingStatus: (id: string, status: ItemStatus) => void;
  toggleFavorite: (listingId: string) => void;
  isFavorite: (listingId: string) => boolean;
  logContact: (listingId: string, channel: 'whatsapp' | 'call' | 'in_app', message?: string) => void;

  // Reports
  submitReport: (listingId: string, reason: ReportReason, details: string, reporterName?: string, reporterPhone?: string) => void;
  resolveReport: (reportId: string, action: 'dismiss' | 'delete_listing' | 'suspend_seller') => void;

  // Admin controls
  toggleFeatured: (listingId: string) => void;
  toggleApproval: (listingId: string) => void;
  toggleUserSuspension: (userId: string) => void;
  addCategory: (category: { id: string; name: string; icon: string; description?: string }) => void;
  switchUserAccount: (userId: string) => void;

  // Auth & Profile
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, sector: string, municipality: string, pass: string, userType?: 'seller' | 'buyer') => Promise<boolean>;
  logout: () => void;
  upgradeToSeller: () => Promise<boolean>;
  updateUserProfile: (data: Partial<Pick<User, 'name' | 'phone' | 'sector' | 'municipality' | 'avatar'>>) => void;
  isMyListing: (listing: Listing) => boolean;
  myCreatedListingIds: string[];
  isLiveConnected: boolean;
  refreshListings: () => Promise<void>;
}

const initialFilterState: FilterState = {
  searchQuery: '',
  categoryId: '',
  minPrice: '',
  maxPrice: '',
  condition: '',
  municipality: '',
  sector: '',
  meetingPlaceType: '',
  sortBy: 'recent',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const GHOST_LISTING_IDS = ['list_1', 'list_2', 'list_3', 'list_4', 'list_5', 'list_6', 'list_7', 'list_8'];
const GHOST_USER_IDS = ['user_carlos', 'user_miguelina', 'user_ramon'];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persistent listings - filter out any ghost/dummy mock items
  const [listings, setListings] = useState<Listing[]>(() => {
    try {
      const saved = localStorage.getItem('vende_todo_hm_listings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((item: Listing) => !GHOST_LISTING_IDS.includes(item.id));
        }
      }
      return INITIAL_LISTINGS;
    } catch {
      return INITIAL_LISTINGS;
    }
  });

  // Track which listings were created on this browser/device for 100% owner control
  const [myCreatedListingIds, setMyCreatedListingIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vende_todo_my_created_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('vende_todo_hm_categories');
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  // Users - filter out dummy sellers
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('vende_todo_hm_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter((u: User) => !GHOST_USER_IDS.includes(u.id));
          return clean.length > 0 ? clean : INITIAL_USERS;
        }
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Current User: check saved active user or ID, default strictly to null if not logged in
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUserStr = localStorage.getItem('vende_todo_hm_active_user');
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        if (parsed && parsed.id && !GHOST_USER_IDS.includes(parsed.id)) {
          return parsed;
        }
      }
      const savedId = localStorage.getItem('vende_todo_hm_current_user_id');
      if (savedId && !GHOST_USER_IDS.includes(savedId)) {
        const savedUsers = localStorage.getItem('vende_todo_hm_users');
        const users: User[] = savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS;
        const found = users.find((u) => u.id === savedId);
        if (found && !GHOST_USER_IDS.includes(found.id)) return found;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Reports
  const [reports, setReports] = useState<Report[]>(() => {
    try {
      const saved = localStorage.getItem('vende_todo_hm_reports');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter((r: Report) => !GHOST_LISTING_IDS.includes(r.listingId)) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  // Buyer contact tracking
  const [buyerContacts, setBuyerContacts] = useState<BuyerContactLog[]>(() => {
    try {
      const saved = localStorage.getItem('vende_todo_hm_contacts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Navigation and Filter state
  const [activeView, setActiveView] = useState<AppView>('home');
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  // Real-time synchronization state
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  // Modals & feedback
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | null>('login');
  const [intendedActionAfterAuth, setIntendedActionAfterAuth] = useState<'publish' | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [activeShareListing, setActiveShareListing] = useState<Listing | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [activeReportListing, setActiveReportListing] = useState<Listing | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  // 1. Initial load from shared server + fallback to local cache
  const refreshListings = async () => {
    try {
      const serverListings = await fetchAllListings();
      if (Array.isArray(serverListings) && serverListings.length > 0) {
        setListings(serverListings);
      }
    } catch (err) {
      console.error('Error refreshing listings:', err);
    }
  };

  // Real-time Firebase Firestore synchronization
  useEffect(() => {
    refreshListings();

    // Subscribe to Firebase Firestore in real-time
    const unsubscribe = subscribeToListings(
      (firestoreListings) => {
        if (Array.isArray(firestoreListings)) {
          setListings(firestoreListings);
          setIsLiveConnected(true);
        }
      },
      (err) => {
        console.warn('Firestore subscription fallback:', err);
      }
    );

    // SSE fallback
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/listings/events');
      eventSource.onopen = () => setIsLiveConnected(true);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'create') {
            const newListing: Listing = data.payload;
            setListings((prev) => {
              if (prev.some((item) => item.id === newListing.id)) return prev;
              return [newListing, ...prev];
            });
            showToast(`📢 Nuevo artículo publicado: "${newListing.title}"`);
          } else if (data.type === 'update' || data.type === 'status') {
            const updated: Listing = data.payload;
            setListings((prev) =>
              prev.map((item) => (item.id === updated.id ? updated : item))
            );
          } else if (data.type === 'delete') {
            const { id } = data.payload;
            setListings((prev) => prev.filter((item) => item.id !== id));
          }
        } catch (e) {
          console.error('SSE error parse:', e);
        }
      };
    } catch {
      // Ignored
    }

    return () => {
      unsubscribe();
      eventSource?.close();
    };
  }, []);

  // Auto-sync state to localStorage
  useEffect(() => {
    localStorage.setItem('vende_todo_hm_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('vende_todo_hm_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('vende_todo_hm_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('vende_todo_hm_active_user', JSON.stringify(currentUser));
      localStorage.setItem('vende_todo_hm_current_user_id', currentUser.id);
    } else {
      localStorage.removeItem('vende_todo_hm_active_user');
      localStorage.removeItem('vende_todo_hm_current_user_id');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('vende_todo_hm_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('vende_todo_hm_contacts', JSON.stringify(buyerContacts));
  }, [buyerContacts]);

  // Nav actions
  const openListingDetail = (id: string) => {
    setSelectedListingId(id);
    setActiveView('listing-detail');
    // Track views both locally and on the server
    recordListingView(id);
    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, views: (item.views || 0) + 1 } : item))
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openSellerProfile = (sellerId: string) => {
    setSelectedSellerId(sellerId);
    setActiveView('seller-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openPublishModal = () => {
    if (!currentUser) {
      setIntendedActionAfterAuth('publish');
      showToast('Para publicar un artículo debes registrarte o iniciar sesión.');
      openAuthModal('register');
      return;
    }
    setActiveView('publish');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEditListing = (listing: Listing) => {
    setEditingListing(listing);
    setActiveView('edit-listing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setFilters(initialFilterState);
  };

  const setSearchQuery = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
    if (activeView !== 'search') {
      setActiveView('search');
    }
  };

  const setCategoryFilter = (categoryId: string) => {
    setFilters((prev) => ({ ...prev, categoryId }));
    if (activeView !== 'search') {
      setActiveView('search');
    }
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Modal triggers
  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setAuthModalTab(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openShareModal = (listing: Listing) => {
    setActiveShareListing(listing);
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
    setActiveShareListing(null);
  };

  const openReportModal = (listing: Listing) => {
    setActiveReportListing(listing);
    setIsReportModalOpen(true);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
    setActiveReportListing(null);
  };

  // Helper to check if the current user or device is the verified owner of a listing
  // Crucial: regular users CANNOT delete or edit items that belong to someone else.
  // Super Admin (viralatoa@gmail.com) has master permissions to delete/moderate any item!
  const isMyListing = (listing: Listing): boolean => {
    if (!listing) return false;
    // 1. Super Admin with master credentials has universal moderation control
    if (currentUser && (currentUser.email.toLowerCase() === 'viralatoa@gmail.com' || currentUser.role === 'admin')) {
      return true;
    }
    // 2. Author holds the secret seller token generated on the server for this listing
    if (hasSellerTokenFor(listing.id)) return true;
    // 3. Author created this listing on this browser session
    if (myCreatedListingIds.includes(listing.id)) return true;
    // 4. User is signed in with the same seller ID
    if (currentUser && listing.sellerId === currentUser.id) return true;
    return false;
  };

  // CRUD Listings - Shared across all users in real time
  const addListing = (
    data: Omit<Listing, 'id' | 'createdAt' | 'views' | 'isApproved' | 'sellerId' | 'sellerName' | 'sellerJoinedDate'> & { sellerName?: string }
  ): string => {
    if (!currentUser) {
      setIntendedActionAfterAuth('publish');
      showToast('Debes registrarte o iniciar sesión para poder publicar tu artículo');
      openAuthModal('register');
      return '';
    }

    const tempId = `list_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const chosenSellerName = data.sellerName?.trim() || currentUser.name || 'Vendedor Hato Mayor';
    const seller = currentUser;

    const fullListing: Listing = {
      id: tempId,
      ...data,
      sellerName: chosenSellerName,
      sellerId: seller.id,
      sellerAvatar: seller.avatar,
      sellerJoinedDate: seller.joinedDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 1,
      isApproved: true,
    };

    // Save directly to Firebase Firestore
    saveListingToFirestore(fullListing).catch((err) => {
      console.warn('Firestore write warning:', err);
    });

    // Persist to shared backend so it appears for EVERYONE in real time
    createSharedListing({
      ...data,
      sellerName: chosenSellerName,
      sellerId: seller.id,
      sellerJoinedDate: seller.joinedDate,
    })
      .then((res) => {
        const savedListing = res.listing;
        setListings((prev) => {
          if (prev.some((item) => item.id === savedListing.id)) {
            return prev.map((item) => (item.id === savedListing.id ? savedListing : item));
          }
          return [savedListing, ...prev];
        });
        setMyCreatedListingIds((prev) => {
          const next = Array.from(new Set([...prev, savedListing.id]));
          localStorage.setItem('vende_todo_my_created_ids', JSON.stringify(next));
          return next;
        });
        openListingDetail(savedListing.id);
        // Automatically pop up the share dialog so the seller can share their publication on WhatsApp!
        setTimeout(() => {
          openShareModal(savedListing);
        }, 600);
      })
      .catch((err) => {
        console.error('Error creating shared listing:', err);
        showToast(err.message || 'Error al guardar en el servidor');
      });

    showToast('¡Tu publicación ha sido subida y ya está visible para todos en Hato Mayor!');
    return tempId;
  };

  const updateListing = (id: string, updatedFields: Partial<Listing>) => {
    // Optimistic local update
    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields, updatedAt: new Date().toISOString() } : item))
    );

    const existing = listings.find((item) => item.id === id);
    if (existing) {
      saveListingToFirestore({ ...existing, ...updatedFields, updatedAt: new Date().toISOString() }).catch((err) => {
        console.warn('Firestore update warning:', err);
      });
    }

    // Shared server update (checks seller token)
    updateSharedListing(id, updatedFields)
      .then((updated) => {
        setListings((prev) =>
          prev.map((item) => (item.id === id ? updated : item))
        );
        showToast('Publicación actualizada correctamente');
      })
      .catch((err) => {
        console.error('Update error:', err);
        showToast(err.message || 'No tienes permiso para modificar esta publicación');
        refreshListings();
      });
  };

  const deleteListing = (id: string) => {
    // Optimistic local update
    setListings((prev) => prev.filter((item) => item.id !== id));
    setMyCreatedListingIds((prev) => prev.filter((i) => i !== id));

    // Firestore deletion
    deleteListingFromFirestore(id).catch((err) => {
      console.warn('Firestore delete warning:', err);
    });

    // Shared server deletion (checks seller token)
    deleteSharedListing(id)
      .then(() => {
        showToast('Publicación eliminada');
        if (selectedListingId === id) {
          setActiveView('home');
        }
      })
      .catch((err) => {
        console.error('Delete error:', err);
        showToast(err.message || 'No tienes permiso para eliminar esta publicación');
        refreshListings();
      });
  };

  const changeListingStatus = (id: string, status: ItemStatus) => {
    // Optimistic update
    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item))
    );

    // Firestore status update
    updateListingStatusInFirestore(id, status).catch((err) => {
      console.warn('Firestore status warning:', err);
    });

    changeSharedListingStatus(id, status)
      .then((updated) => {
        setListings((prev) =>
          prev.map((item) => (item.id === id ? updated : item))
        );
        if (status === 'Vendido') {
          showToast('Artículo marcado como Vendido. ¡Felicidades!');
        } else {
          showToast(`Estado cambiado a "${status}"`);
        }
      })
      .catch((err) => {
        console.error('Status change error:', err);
        showToast(err.message || 'No tienes permiso para cambiar el estado');
        refreshListings();
      });
  };

  // Favorites
  const toggleFavorite = (listingId: string) => {
    if (!currentUser) {
      openAuthModal('login');
      showToast('Inicia sesión para guardar favoritos');
      return;
    }

    const currentFavs = currentUser.favorites || [];
    const exists = currentFavs.includes(listingId);
    const updatedFavs = exists
      ? currentFavs.filter((id) => id !== listingId)
      : [...currentFavs, listingId];

    const updatedUser = { ...currentUser, favorites: updatedFavs };
    setCurrentUser(updatedUser);
    setAllUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    saveUserToFirestore(updatedUser).catch(() => {});

    showToast(exists ? 'Eliminado de favoritos' : '¡Guardado en favoritos!');
  };

  const isFavorite = (listingId: string): boolean => {
    return currentUser ? currentUser.favorites?.includes(listingId) || false : false;
  };

  // Log contact
  const logContact = (listingId: string, channel: 'whatsapp' | 'call' | 'in_app', message?: string) => {
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return;

    const newContact: BuyerContactLog = {
      id: `contact_${Date.now()}`,
      listingId,
      listingTitle: listing.title,
      sellerId: listing.sellerId,
      buyerName: currentUser?.name || 'Comprador interesado',
      buyerPhone: currentUser?.phone || 'No especificado',
      buyerMessage: message || `Contacto por ${channel}`,
      channel,
      createdAt: new Date().toISOString(),
    };

    setBuyerContacts((prev) => [newContact, ...prev]);
  };

  // Reports
  const submitReport = (
    listingId: string,
    reason: ReportReason,
    details: string,
    reporterName?: string,
    reporterPhone?: string
  ) => {
    const listing = listings.find((l) => l.id === listingId);
    const newReport: Report = {
      id: `rep_${Date.now()}`,
      listingId,
      listingTitle: listing?.title || 'Publicación',
      sellerId: listing?.sellerId || 'unknown',
      reportedByName: reporterName || currentUser?.name || 'Usuario Anónimo',
      reportedByPhone: reporterPhone || currentUser?.phone || '',
      reason,
      details,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    setReports((prev) => [newReport, ...prev]);
    closeReportModal();
    showToast('Reporte enviado a la administración. Gracias por ayudar a la comunidad.');
  };

  const resolveReport = (reportId: string, action: 'dismiss' | 'delete_listing' | 'suspend_seller') => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    if (action === 'delete_listing') {
      deleteListing(report.listingId);
    } else if (action === 'suspend_seller') {
      toggleUserSuspension(report.sellerId);
    }

    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: action === 'dismiss' ? 'dismissed' : 'resolved' } : r))
    );
    showToast('Reporte procesado por el administrador');
  };

  // Admin features
  const toggleFeatured = (listingId: string) => {
    setListings((prev) =>
      prev.map((item) =>
        item.id === listingId ? { ...item, isFeatured: !item.isFeatured } : item
      )
    );
    showToast('Estado destacado actualizado');
  };

  const toggleApproval = (listingId: string) => {
    setListings((prev) =>
      prev.map((item) =>
        item.id === listingId ? { ...item, isApproved: !item.isApproved } : item
      )
    );
    showToast('Aprobación de publicación actualizada');
  };

  const toggleUserSuspension = (userId: string) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isSuspended: !u.isSuspended } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, isSuspended: !prev.isSuspended } : null));
    }
    showToast('Estado de usuario modificado');
  };

  const addCategory = (cat: { id: string; name: string; icon: string; description?: string }) => {
    if (categories.some((c) => c.id === cat.id)) {
      showToast('Ya existe una categoría con este identificador');
      return;
    }
    setCategories((prev) => [...prev, cat]);
    showToast(`Categoría "${cat.name}" añadida con éxito`);
  };

  const switchUserAccount = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      showToast(`Cambiado a cuenta: ${target.name} (${target.role === 'admin' ? 'Administrador' : 'Vendedor'})`);
    }
  };

  // Auth methods - backend secured + Firestore backed
  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await loginUser(email, pass);
      setCurrentUser(res.user);
      setIsAuthModalOpen(false);

      // Save user to local collection if not present
      setAllUsers((prev) => {
        if (!prev.some((u) => u.id === res.user.id)) {
          return [...prev, res.user];
        }
        return prev;
      });

      // Save / sync to Firestore
      saveUserToFirestore(res.user).catch(() => {});

      if (intendedActionAfterAuth === 'publish') {
        setIntendedActionAfterAuth(null);
        setActiveView('publish');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast(`¡Bienvenido de nuevo, ${res.user.name}! Ya puedes publicar tu artículo.`);
      } else {
        if (res.isAdmin) {
          showToast('¡Sesión iniciada con control total de Administrador!');
        } else {
          showToast(`¡Bienvenido de nuevo, ${res.user.name}!`);
        }
      }
      return true;
    } catch (err: any) {
      showToast(err.message || 'Error al iniciar sesión');
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    sector: string,
    municipality: string,
    pass: string,
    userType: 'seller' | 'buyer' = 'seller'
  ): Promise<boolean> => {
    try {
      const res = await registerUser({
        name,
        email,
        phone,
        sector,
        municipality,
        password: pass,
        userType,
      });

      const registeredUser: User = {
        ...res.user,
        userType: res.user.userType || userType,
      };

      setCurrentUser(registeredUser);
      setAllUsers((prev) => [...prev, registeredUser]);
      saveUserToFirestore(registeredUser).catch(() => {});
      setIsAuthModalOpen(false);

      if (intendedActionAfterAuth === 'publish') {
        setIntendedActionAfterAuth(null);
        setActiveView('publish');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast(`¡Cuenta creada con éxito! Bienvenido, ${name}. Ya puedes publicar tu artículo.`);
      } else {
        showToast(`¡Cuenta creada con éxito! Bienvenido a Hato Mayor, ${name}`);
      }
      return true;
    } catch (err: any) {
      showToast(err.message || 'Error al registrar usuario');
      return false;
    }
  };

  const upgradeToSeller = async (): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const updatedUserFromApi = await upgradeToSellerApi(currentUser.id);
      const updatedUser: User = {
        ...currentUser,
        ...updatedUserFromApi,
        userType: 'seller',
      };
      setCurrentUser(updatedUser);
      setAllUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
      saveUserToFirestore(updatedUser).catch(() => {});
      showToast('¡Tu cuenta ahora tiene permisos de Vendedor! Ya puedes publicar gratis.');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar a cuenta vendedor');
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    removeAdminToken();
    localStorage.removeItem('vende_todo_hm_active_user');
    localStorage.removeItem('vende_todo_hm_current_user_id');
    localStorage.removeItem('vende_todo_admin_token');
    setActiveView('home');
    setSelectedListingId(null);
    setEditingListing(null);
    setIntendedActionAfterAuth(null);
    setIsAuthModalOpen(false);
    showToast('Has cerrado sesión exitosamente. Vuelve pronto.');
  };

  const updateUserProfile = (data: Partial<Pick<User, 'name' | 'phone' | 'sector' | 'municipality' | 'avatar'>>) => {
    if (!currentUser) return;
    const updated: User = { ...currentUser, ...data };
    setCurrentUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    saveUserToFirestore(updated).catch(() => {});
    showToast('Perfil actualizado correctamente');
  };

  return (
    <AppContext.Provider
      value={{
        listings,
        categories,
        currentUser,
        allUsers,
        reports,
        buyerContacts,
        filters,
        activeView,
        selectedListingId,
        selectedSellerId,
        editingListing,
        isAuthModalOpen,
        authMode,
        authModalTab,
        intendedActionAfterAuth,
        isShareModalOpen,
        activeShareListing,
        isReportModalOpen,
        activeReportListing,
        toastMessage,

        setActiveView,
        openListingDetail,
        openSellerProfile,
        openPublishModal,
        openEditListing,
        setFilters,
        resetFilters,
        setSearchQuery,
        setCategoryFilter,

        openAuthModal,
        closeAuthModal,
        openShareModal,
        closeShareModal,
        openReportModal,
        closeReportModal,
        showToast,

        addListing,
        updateListing,
        deleteListing,
        changeListingStatus,
        toggleFavorite,
        isFavorite,
        logContact,

        submitReport,
        resolveReport,

        toggleFeatured,
        toggleApproval,
        toggleUserSuspension,
        addCategory,
        switchUserAccount,

        login,
        register,
        logout,
        upgradeToSeller,
        updateUserProfile,
        isMyListing,
        myCreatedListingIds,
        isLiveConnected,
        refreshListings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
