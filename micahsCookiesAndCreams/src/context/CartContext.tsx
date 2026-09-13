import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useDataContext } from "./DataContext";
import type { CartItemType, IngredientSpec, SizeSpec } from "../types";

const CART_STORAGE_KEY = "cartItems";

export interface AddCartItemInput {
  flavorId: string;
  flavorName: string;
  sizeId: string;
  sizeName: string;
  quantity?: number;
  unitPrice?: number;
  isLactoseFree?: boolean;
  recipeName?: string;
  notes?: string;
  mixIns?: string[];
  sweeteners?: string[];
  ingredients?: IngredientSpec[];
}

export interface CartContextValue {
  items: CartItemType[];
  totalItems: number;
  subtotal: number;
  addItem: (item: AddCartItemInput) => void;
  updateItem: (id: string, updates: Partial<CartItemType>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getItemById: (id: string) => CartItemType | undefined;
  saveCart: () => void;
  loadCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const buildCartItemId = () => `cart-item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const { flavorWorksheet, premadeWorksheet, sizeSpecsDict } = useDataContext();
  const [items, setItems] = useState<CartItemType[]>([]);

  const saveCart = useCallback(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const loadCart = useCallback(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) {
        setItems([]);
        return;
      }

      const parsed = JSON.parse(raw) as CartItemType[];
      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    saveCart();
  }, [items, saveCart]);

  const addItem = useCallback(
    (input: AddCartItemInput) => {
      const quantity = Math.max(1, Number(input.quantity ?? 1));
      const unitPrice = Number(input.unitPrice ?? 0);
      const sizeMeta = sizeSpecsDict[input.sizeId] ?? ({
        id: input.sizeId,
        name: input.sizeName,
        amount: 0,
        multiplier: 1,
        containerCost: 0,
        additionalCost: 0,
      } as SizeSpec);

      const flavorRecord = flavorWorksheet[input.flavorId] ?? premadeWorksheet[input.flavorId] ?? {};

      const newItem: CartItemType = {
        id: buildCartItemId(),
        flavorId: input.flavorId,
        flavorName: input.flavorName,
        sizeId: input.sizeId,
        sizeName: input.sizeName,
        quantity,
        unitPrice,
        totalPrice: Number((unitPrice * quantity).toFixed(2)),
        isLactoseFree: Boolean(input.isLactoseFree),
        recipeName: input.recipeName,
        notes: input.notes,
        mixIns: input.mixIns ?? [],
        sweeteners: input.sweeteners ?? [],
        ingredients: input.ingredients ?? [
          {
            name: input.flavorName,
            amount: sizeMeta.amount,
            type: "base",
            label: input.sizeName,
          },
          ...Object.entries(flavorRecord)
            .filter(([key, value]) =>
              typeof value !== "undefined" &&
              key !== "Cost ($)" &&
              key !== "Calories" &&
              key !== "Description"
            )
            .slice(0, 6)
            .map(([key, value]) => ({
              name: key,
              label: String(value),
              type: "worksheet",
            }))
        ],
      };

      setItems((current) => {
        const existingIndex = current.findIndex((item) => item.flavorId === input.flavorId && item.sizeId === input.sizeId && item.recipeName === input.recipeName);

        if (existingIndex >= 0) {
          const updated = [...current];
          const existing = updated[existingIndex];
          const mergedQuantity = existing.quantity + quantity;
          updated[existingIndex] = {
            ...existing,
            quantity: mergedQuantity,
            totalPrice: Number((unitPrice * mergedQuantity).toFixed(2)),
            unitPrice,
            isLactoseFree: Boolean(input.isLactoseFree),
            notes: input.notes ?? existing.notes,
          };
          return updated;
        }

        return [...current, newItem];
      });
    },
    [flavorWorksheet, premadeWorksheet, sizeSpecsDict]
  );

  const updateItem = useCallback((id: string, updates: Partial<CartItemType>) => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;

        const nextItem = { ...item, ...updates };
        const nextQuantity = Number(nextItem.quantity ?? item.quantity);
        const nextUnitPrice = Number(nextItem.unitPrice ?? item.unitPrice);
        nextItem.totalPrice = Number((nextUnitPrice * nextQuantity).toFixed(2));
        return nextItem;
      })
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getItemById = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.totalPrice, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalItems,
      subtotal: Number(subtotal.toFixed(2)),
      addItem,
      updateItem,
      removeItem,
      clearCart,
      getItemById,
      saveCart,
      loadCart,
    }),
    [items, totalItems, subtotal, addItem, updateItem, removeItem, clearCart, getItemById, saveCart, loadCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }

  return context;
}

export default CartContext;
