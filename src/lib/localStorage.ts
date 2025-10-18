// LocalStorage utility functions for FarmLinkJA

export interface User {
  id: string;
  email: string;
  password: string;
  role: 'farmer' | 'buyer';
  name: string;
}

export interface Crop {
  id: string;
  farmerId: string;
  cropName: string;
  cropType: string;
  plantDate: string;
  harvestDate: string;
  quantity: number;
  unit: string;
  status: 'available' | 'sold';
  price?: number;
}

export interface Sale {
  id: string;
  cropId: string;
  farmerId: string;
  buyerId: string;
  buyerName: string;
  cropName: string;
  quantity: number;
  price: number;
  total: number;
  date: string;
}

const STORAGE_KEYS = {
  USERS: 'farmlinkja_users',
  CURRENT_USER: 'farmlinkja_current_user',
  CROPS: 'farmlinkja_crops',
  SALES: 'farmlinkja_sales',
};

// User management
export const getUsers = (): User[] => {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const findUserByEmail = (email: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.email === email);
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
};

export const clearCurrentUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

// Crop management
export const getCrops = (): Crop[] => {
  const crops = localStorage.getItem(STORAGE_KEYS.CROPS);
  return crops ? JSON.parse(crops) : [];
};

export const saveCrop = (crop: Crop): void => {
  const crops = getCrops();
  crops.push(crop);
  localStorage.setItem(STORAGE_KEYS.CROPS, JSON.stringify(crops));
};

export const updateCrop = (updatedCrop: Crop): void => {
  const crops = getCrops();
  const index = crops.findIndex(c => c.id === updatedCrop.id);
  if (index !== -1) {
    crops[index] = updatedCrop;
    localStorage.setItem(STORAGE_KEYS.CROPS, JSON.stringify(crops));
  }
};

export const deleteCrop = (cropId: string): void => {
  const crops = getCrops();
  const filtered = crops.filter(c => c.id !== cropId);
  localStorage.setItem(STORAGE_KEYS.CROPS, JSON.stringify(filtered));
};

export const getCropsByFarmer = (farmerId: string): Crop[] => {
  const crops = getCrops();
  return crops.filter(c => c.farmerId === farmerId);
};

export const getAvailableCrops = (): Crop[] => {
  const crops = getCrops();
  return crops.filter(c => c.status === 'available' && c.quantity > 0);
};

// Sales management
export const getSales = (): Sale[] => {
  const sales = localStorage.getItem(STORAGE_KEYS.SALES);
  return sales ? JSON.parse(sales) : [];
};

export const saveSale = (sale: Sale): void => {
  const sales = getSales();
  sales.push(sale);
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
};

export const getSalesByFarmer = (farmerId: string): Sale[] => {
  const sales = getSales();
  return sales.filter(s => s.farmerId === farmerId);
};

export const getSalesByBuyer = (buyerId: string): Sale[] => {
  const sales = getSales();
  return sales.filter(s => s.buyerId === buyerId);
};
