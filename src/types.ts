export interface Tool {
  id: string;
  name: string;
  category: 'formwork' | 'power' | 'concrete' | 'measuring' | 'garden' | 'other';
  description: string;
  pricePerDay: number; // in Russian Rubles or KZT (let's use Russian Rubles '₽', but make it clear)
  deposit: number;
  unit: string;
  imageUrl?: string;
  specs: { [key: string]: string };
}

export interface ProjectCalculation {
  id: string;
  name: string;
  createdAt: string;
  structureType: 'walls' | 'foundation_strip' | 'foundation_slab' | 'columns';
  dimensions: {
    length: number; // meters
    height: number; // meters
    width?: number; // meters (thickness of wall or slab width)
    thickness?: number; // wall thickness in mm
    columnCount?: number;
    columnSide?: number; // mm
    internalCornersCount: number;
    externalCornersCount: number;
  };
  durationDays: number;
  results: FormworkRequirement[];
  photos?: string[]; // Base64 compressed image URLs
}

export interface FormworkRequirement {
  id: string;
  name: string;
  russianName: string;
  quantity: number;
  unit: string;
  weightPerUnit: number; // kg
  pricePerDay: number; // rub
  depositPerUnit: number; // rub
  totalPrice: number;
  totalDeposit: number;
  totalWeight: number;
}

export interface OrderCart {
  tools: { tool: Tool; quantity: number; days: number }[];
  projects: ProjectCalculation[];
  clientName: string;
  clientPhone: string;
  deliveryNeeded: boolean;
  deliveryAddress: string;
}
