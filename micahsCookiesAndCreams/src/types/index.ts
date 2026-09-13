// src/types/index.ts

export type CellValue = string | number | boolean | null;

export type WorksheetRow = Record<string, CellValue | undefined>;

export type WorksheetDict = Record<string, WorksheetRow>;

export type SpecsDictionary = Record<string, number>;

export type SizeSpecDict = Record<string, SizeSpec>;

export interface NutritionInfo {
  calories?: number;
  fat?: number;
  fiber?: number;
  carbs?: number;
  sugar?: number;
  protein?: number;
  sodium?: number;
  lactose?: number;
  [key: string]: number | undefined;
}

export interface IngredientSpec {
  id?: string;
  name: string;
  label?: string;
  amount?: number;
  grams?: number;
  unit?: string;
  price?: number;
  calories?: number;
  fat?: number;
  carbs?: number;
  sugar?: number;
  protein?: number;
  lactoseDrops?: number;
  type?: string;
  [key: string]: string | number | undefined;
}

export interface SizeSpec {
  id: string;
  name: string;
  amount: number;
  multiplier: number;
  containerCost: number;
  additionalCost: number;
  price?: number;
  label?: string;
  isSample?: boolean;
  [key: string]: string | number | boolean | undefined;
}

export interface FlavorSpec {
  id: string;
  name: string;
  description?: string;
  basePrice?: number;
  price?: number;
  imageUrl?: string;
  imagePath?: string;
  category?: string;
  hasSamples?: boolean;
  lactoseFree?: boolean;
  sizeOptions?: string[];
  nutrition?: NutritionInfo;
  ingredients?: IngredientSpec[];
  [key: string]: unknown;
}

export interface PremadeFlavorSpec extends FlavorSpec {
  hasSamples?: boolean;
  description: string;
  flavorCategory?: string;
  image?: string;
  [key: string]: unknown;
}

export interface CartItemType {
  id: string;
  flavorId: string;
  flavorName: string;
  sizeId: string;
  sizeName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isLactoseFree: boolean;
  recipeName?: string;
  notes?: string;
  mixIns?: string[];
  sweeteners?: string[];
  ingredients?: IngredientSpec[];
  [key: string]: unknown;
}

export interface RecipeEntry {
  id: string;
  name: string;
  size: string;
  ingredients: IngredientSpec[];
  totalPrice?: number;
  isLactoseFree?: boolean;
  notes?: string;
}

export interface CustomizationOptions {
  size?: string;
  milkType1?: string;
  milkType2?: string;
  thickener?: string;
  thickener2?: string;
  thickener3?: string;
  liquidMix1?: string;
  liquidMix2?: string;
  sweetener1?: string;
  sweetener2?: string;
  mixIn1?: string;
  mixIn2?: string;
  [key: string]: string | undefined;
}

export interface PriceBreakdown {
  liquidMix1?: number;
  liquidMix2?: number;
  sweetener1?: number;
  sweetener2?: number;
  mixIn1?: number;
  mixIn2?: number;
  milkType1?: number;
  milkType2?: number;
  thickener?: number;
  thickener2?: number;
  thickener3?: number;
  total?: number;
  [key: string]: number | undefined;
}