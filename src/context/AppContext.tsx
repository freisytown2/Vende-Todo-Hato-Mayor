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
  isShareModalOpen: boolean;
  activeShareListing: Listing | null;
  isReportModalOpen: boolean;
  activeReportListing: Listing | null;
  toastMessage: string | null;

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
  addListing: (newListing: Omit<Listing, 'id' | 'createdAt' | 'views' | 'isApproved' | 'sellerId' | 'sellerName' | 'sellerJoinedDate'>) => string;
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

  // Auth
  login: (email: string, pass: string) => boolean;
  register: (name: string, email: string, phone: string, sector: string, municipality: string, pass: string) => boolean;
  logout: () => void;
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persistent listings or fallback to defaults
  const [listings, setListings] = useState<Listing[]>(() => {
    try {
      const saved = localStorage.getItem('vende_todo_hm_listings');
      return saved ? JSON.parse(saved) : INITIAL_LISTINGS;
    } catch {
      return INITIAL_LISTINGS;
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

  // Users
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('vende_todo_hm_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Current User: default to Carlos (active seller) so everything is immediately functional
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedId = localStorage.getItem('vende_todo_hm_current_user_id');
      if (savedId) {
        const found = allUsers.find((u) => u.id === savedId);
        if (found) return found;
      }
      return INITIAL_USERS[1]; // Carlos Manuel Rosario
    } catch {
      return INITIAL_USERS[1];
    }
  });

  // Reports
  const [reports, setReports] = useState<Report[]>(() => {
    try {
      const saved = localStorage.getItem('vende_todo_hm_reports');
      return saved ? JSON.parse(saved) : [
        {
          id: 'rep_1',
          listingId: 'list_1',
          listingTitle: 'Motor CG 200 Tauro año 2023 - Casi Nuevo',
          sellerId: 'user_carlos',
          reportedByName: 'Juan Pérez',
          reportedByPhone: '8095551212',
          reason: 'Información falsa' as ReportReason,
          details: 'Verificar si los papeles están realmente a su nombre.',
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          status: 'pending',
        }
      ];
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

  // Modals & feedback
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [activeShareListing, setActiveShareListing] = useState<Listing | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [activeReportListing, setActiveReportListing] = useState<Listing | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      localStorage.setItem('vende_todo_hm_current_user_id', currentUser.id);
    } else {
      localStorage.removeItem('vende_todo_hm_current_user_id');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('vende_todo_hm_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('vende_todo_hm_contacts', JSON.stringify(buyerContacts));
  }, [buyerContacts]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Nav actions
  const openListingDetail = (id: string) => {
    setSelectedListingId(id);
    setActiveView('listing-detail');
    // Track views
    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, views: item.views + 1 } : item))
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
      setAuthMode('login');
      setIsAuthModalOpen(true);
      showToast('Inicia sesión o regístrate para publicar tu artículo');
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

  // CRUD Listings
  const addListing = (
    data: Omit<Listing, 'id' | 'createdAt' | 'views' | 'isApproved' | 'sellerId' | 'sellerName' | 'sellerJoinedDate'>
  ): string => {
    const id = `list_${Date.now()}`;
    const newListing: Listing = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      views: 1,
      isApproved: true,
      sellerId: currentUser?.id || 'guest',
      sellerName: currentUser?.name || 'Vendedor Hato Mayor',
      sellerAvatar: currentUser?.avatar,
      sellerJoinedDate: currentUser?.joinedDate || new Date().toISOString(),
      isFeatured: false,
    };

    setListings((prev) => [newListing, ...prev]);
    showToast('¡Tu publicación ha sido creada con éxito!');
    openListingDetail(id);
    return id;
  };

  const updateListing = (id: string, updatedFields: Partial<Listing>) => {
    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
    showToast('Publicación actualizada correctamente');
  };

  const deleteListing = (id: string) => {
    setListings((prev) => prev.filter((item) => item.id !== id));
    showToast('Publicación eliminada');
    if (selectedListingId === id) {
      setActiveView('home');
    }
  };

  const changeListingStatus = (id: string, status: ItemStatus) => {
    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
    if (status === 'Vendido') {
      showToast('Artículo marcado como Vendido. ¡Felicidades!');
    } else {
      showToast(`Estado cambiado a "${status}"`);
    }
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

  // Auth methods
  const login = (email: string, _pass: string): boolean => {
    const existing = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      if (existing.isSuspended) {
        showToast('Esta cuenta se encuentra suspendida por infringir normas.');
        return false;
      }
      setCurrentUser(existing);
      setIsAuthModalOpen(false);
      showToast(`¡Bienvenido de nuevo, ${existing.name}!`);
      return true;
    }

    // Quick auto-registration if doesn't exist for test convenience
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: email.split('@')[0],
      email,
      phone: '8095550000',
      sector: 'Centro de Hato Mayor',
      municipality: 'Hato Mayor del Rey',
      role: 'user',
      isSuspended: false,
      joinedDate: new Date().toISOString(),
      favorites: [],
    };
    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthModalOpen(false);
    showToast(`¡Bienvenido a Vende Todo en Hato Mayor, ${newUser.name}!`);
    return true;
  };

  const register = (
    name: string,
    email: string,
    phone: string,
    sector: string,
    municipality: string,
    _pass: string
  ): boolean => {
    const existing = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      showToast('Ya existe una cuenta con este correo electrónico.');
      return false;
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      phone,
      sector: sector || 'Centro de Hato Mayor',
      municipality: municipality || 'Hato Mayor del Rey',
      role: 'user',
      isSuspended: false,
      joinedDate: new Date().toISOString(),
      favorites: [],
    };

    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthModalOpen(false);
    showToast(`¡Cuenta creada con éxito! Bienvenido, ${name}`);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveView('home');
    showToast('Has cerrado sesión');
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
