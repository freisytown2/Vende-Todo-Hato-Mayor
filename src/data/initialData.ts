import { Category, Listing, User } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'motor', name: 'Motor', icon: 'Bike', description: 'Motores, pasolas, partes y accesorios' },
  { id: 'celulares', name: 'Celulares', icon: 'Smartphone', description: 'Smartphones, iPhones, tablets y accesorios' },
  { id: 'vehiculos', name: 'Vehículos', icon: 'Car', description: 'Carros, jeeps, camionetas y repuestos' },
  { id: 'electrodomesticos', name: 'Electrodomésticos', icon: 'Refrigerator', description: 'Neveras, estufas, lavadoras y aires' },
  { id: 'computadoras', name: 'Computadoras y tecnología', icon: 'Laptop', description: 'Laptops, computadoras de escritorio, impresoras' },
  { id: 'muebles', name: 'Muebles', icon: 'Armchair', description: 'Camas, juegos de sala, comedores y gaveteros' },
  { id: 'hogar', name: 'Hogar', icon: 'Home', description: 'Artículos para la casa, cocina y decoración' },
  { id: 'ropa', name: 'Ropa y calzado', icon: 'Shirt', description: 'Ropa para dama, caballero, calzado y accesorios' },
  { id: 'terrenos', name: 'Terrenos e inmuebles', icon: 'Building2', description: 'Solares, casas, apartamentos y fincas' },
  { id: 'agricultura', name: 'Agricultura', icon: 'Sprout', description: 'Equipos agrícolas, abonos, cítricos y herramientas' },
  { id: 'herramientas', name: 'Herramientas', icon: 'Wrench', description: 'Herramientas manuales, eléctricas y de construcción' },
  { id: 'deportes', name: 'Deportes', icon: 'Trophy', description: 'Artículos de béisbol, fitness, bicicletas y pesas' },
  { id: 'ninos', name: 'Niños y bebés', icon: 'Baby', description: 'Coches, cunas, ropa infantil y juguetes' },
  { id: 'animales', name: 'Animales', icon: 'Dog', description: 'Mascotas, ganado, aves y alimentos para animales' },
  { id: 'servicios', name: 'Servicios', icon: 'Briefcase', description: 'Técnicos, plomería, electricidad, mecánica' },
  { id: 'empleos', name: 'Empleos', icon: 'UserCheck', description: 'Ofertas y solicitudes de empleo locales' },
  { id: 'otros', name: 'Otros', icon: 'Package', description: 'Cualquier otro artículo o mercancía' },
];

export const MUNICIPALITIES = [
  {
    name: 'Hato Mayor del Rey',
    sectors: [
      'Centro de Hato Mayor',
      'Las Malvinas',
      'Villa Canto',
      'Ondina',
      'Puerto Rico',
      'La China',
      'Manchado',
      'Los Girasoles',
      'Barrio Lindo',
      'San Antonio',
      'Jalonga',
      'Villa Navarro',
      'Mata Palacio',
      'Guayabo Dulce',
    ],
  },
  {
    name: 'El Valle',
    sectors: ['Centro El Valle', 'Barrio 27 de Febrero', 'Pueblo Nuevo', 'San José', 'El Brisal'],
  },
  {
    name: 'Sabana de la Mar',
    sectors: ['Centro Sabana de la Mar', 'Las Cañitas', 'Pajarito', 'Los Guineos', 'San Carlos'],
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user_admin',
    name: 'Administración Hato Mayor',
    email: 'admin@vendetodo.do',
    phone: '8095532020',
    sector: 'Centro de Hato Mayor',
    municipality: 'Hato Mayor del Rey',
    userType: 'seller',
    role: 'admin',
    isSuspended: false,
    joinedDate: '2025-01-10T10:00:00Z',
    favorites: [],
  },
];

export const INITIAL_LISTINGS: Listing[] = [];

