import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { MenuItem, Category } from '../types/menu';
import type { Order, CartItem, OrderStatus } from '../types/order';
import type { AppSettings } from '../types/settings';
import { apiClient } from '../services/apiClient';
import { rankOrders } from '../services/priorityEngine';
import { INITIAL_SETTINGS } from '../data/initialSettings';

interface ExcelSyncState {
  isSaving: boolean;
  lastSavedAt: string | null;
  message: string | null;
  graphMessage: string | null;
}

interface AppContextType {
  menu: MenuItem[];
  categories: Category[];
  orders: Order[];
  settings: AppSettings;
  cart: CartItem[];
  activeCategory: string;
  excelSync: ExcelSyncState;
  nowTick: number;

  // Cart operations
  setActiveCategory: (catId: string) => void;
  addToCart: (item: MenuItem, quantity?: number, notes?: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;
  placeOrder: (customerName?: string, customerPhone?: string, discount?: number) => Promise<Order>;

  // Order management operations
  completeOrderItemUnit: (orderId: string, orderItemId: string) => void;
  undoOrderItemUnit: (orderId: string, orderItemId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cancelOrder: (orderId: string) => void;
  markDelivered: (orderId: string) => void;
  generateDemoOrders: () => void;

  // Menu Admin operations
  updateItemPrice: (itemId: string, price: number) => void;
  toggleItemAvailability: (itemId: string) => void;
  addMenuItem: (item: Omit<MenuItem, 'itemId' | 'createdAt' | 'updatedAt'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (itemId: string) => void;
  addCategory: (cat: Omit<Category, 'categoryId'>) => void;
  updateCategory: (cat: Category) => void;
  deleteCategory: (catId: string) => void;

  // Settings & Excel operations
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  exportExcelDatabase: () => void;
  importExcelDatabase: (file: File) => Promise<void>;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('cat_burgers');
  const [nowTick, setNowTick] = useState<number>(Date.now());
  const [excelSync, setExcelSync] = useState<ExcelSyncState>({
    isSaving: false,
    lastSavedAt: new Date().toLocaleTimeString(),
    message: 'Connected to local Excel backend (FLOW_POS.xlsx)',
    graphMessage: null,
  });

  // Load initial data from REST API backend
  const refreshData = useCallback(async () => {
    try {
      setExcelSync((prev) => ({ ...prev, isSaving: true }));
      const [cats, menuItems, orderItemsList, appSettings] = await Promise.all([
        apiClient.getCategories().catch(() => []),
        apiClient.getMenuItems().catch(() => []),
        apiClient.getOrders().catch(() => []),
        apiClient.getSettings().catch(() => INITIAL_SETTINGS),
      ]);

      if (cats.length > 0) {
        setCategories(cats);
        if (!cats.some((c) => c.categoryId === activeCategory)) {
          setActiveCategory(cats[0].categoryId);
        }
      }
      if (menuItems.length > 0) setMenu(menuItems);
      setOrders(orderItemsList);
      if (appSettings) setSettings(appSettings as AppSettings);

      setExcelSync({
        isSaving: false,
        lastSavedAt: new Date().toLocaleTimeString(),
        message: 'FLOW_POS.xlsx synced',
        graphMessage: null,
      });
    } catch (err) {
      console.error('Failed to load data from backend:', err);
      setExcelSync((prev) => ({ ...prev, isSaving: false }));
    }
  }, [activeCategory]);

  useEffect(() => {
    refreshData();
  }, []);

  // Poll active orders every 3 seconds
  useEffect(() => {
    const pollTimer = setInterval(async () => {
      try {
        const activeOrds = await apiClient.getOrders();
        setOrders(activeOrds);
      } catch (err) {
        // Silently handle polling errors
      }
    }, 3000);
    return () => clearInterval(pollTimer);
  }, []);

  // Timer tick for live waiting display
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rank active orders using smart priority engine
  const rankedOrders = useMemo(() => {
    return rankOrders(orders, settings, nowTick);
  }, [orders, settings, nowTick]);

  // Cart operations
  const addToCart = useCallback((item: MenuItem, quantity = 1, notes?: string) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.item.itemId === item.itemId);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + quantity,
          notes: notes !== undefined ? notes : updated[idx].notes,
        };
        return updated;
      }
      return [
        ...prev,
        {
          item: {
            itemId: item.itemId,
            itemName: item.itemName,
            price: item.price,
            categoryName: item.categoryName,
          },
          quantity,
          notes,
        },
      ];
    });
  }, []);

  const updateCartQuantity = useCallback((itemId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((c) => c.item.itemId !== itemId);
      }
      return prev.map((c) => (c.item.itemId === itemId ? { ...c, quantity } : c));
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.itemId !== itemId));
  }, []);

  const updateCartNotes = useCallback((itemId: string, notes: string) => {
    setCart((prev) =>
      prev.map((c) => (c.item.itemId === itemId ? { ...c, notes } : c))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const placeOrder = useCallback(
    async (customerName = 'Walk-in Customer', customerPhone = '', discount = 0): Promise<Order> => {
      if (cart.length === 0) throw new Error('Cart is empty');

      const itemsPayload = cart.map((c) => ({
        itemId: c.item.itemId,
        quantity: c.quantity,
        notes: c.notes,
      }));

      const createdOrder = await apiClient.createOrder(
        itemsPayload,
        customerName,
        customerPhone,
        discount
      );

      setCart([]);
      await refreshData();
      return createdOrder;
    },
    [cart, refreshData]
  );

  // Item-level completion
  const completeOrderItemUnit = useCallback(
    async (_orderId: string, orderItemId: string) => {
      try {
        const updatedOrder = await apiClient.completeOrderItemUnit(orderItemId);
        setOrders((prev) =>
          prev.map((o) => (o.orderId === updatedOrder.orderId ? updatedOrder : o))
        );
      } catch (err) {
        console.error('Failed to complete item unit:', err);
      }
    },
    []
  );

  const undoOrderItemUnit = useCallback(
    async (_orderId: string, orderItemId: string) => {
      try {
        const updatedOrder = await apiClient.undoOrderItemUnit(orderItemId);
        setOrders((prev) =>
          prev.map((o) => (o.orderId === updatedOrder.orderId ? updatedOrder : o))
        );
      } catch (err) {
        console.error('Failed to undo item unit:', err);
      }
    },
    []
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      try {
        const updated = await apiClient.updateOrderStatus(orderId, status);
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? updated : o))
        );
      } catch (err) {
        console.error('Failed to update order status:', err);
      }
    },
    []
  );

  const cancelOrder = useCallback((orderId: string) => {
    updateOrderStatus(orderId, 'CANCELLED');
  }, [updateOrderStatus]);

  const markDelivered = useCallback((orderId: string) => {
    updateOrderStatus(orderId, 'DELIVERED');
  }, [updateOrderStatus]);

  const generateDemoOrders = useCallback(async () => {
    if (menu.length === 0) return;

    const sample1 = [
      { itemId: menu[0].itemId, quantity: 2, notes: 'No onions' },
      { itemId: menu[Math.min(4, menu.length - 1)].itemId, quantity: 1 },
    ];
    const sample2 = [
      { itemId: menu[Math.min(2, menu.length - 1)].itemId, quantity: 3, notes: 'Extra spicy' },
    ];

    await apiClient.createOrder(sample1, 'Rahul Verma', '9876543210', 0);
    await apiClient.createOrder(sample2, 'Priya Sharma', '9123456789', 20);
    await refreshData();
  }, [menu, refreshData]);

  // Menu operations
  const updateItemPrice = useCallback(
    async (itemId: string, price: number) => {
      try {
        await apiClient.updateItemPrice(itemId, price);
        setMenu((prev) =>
          prev.map((m) => (m.itemId === itemId ? { ...m, price } : m))
        );
      } catch (err) {
        console.error('Failed to update price:', err);
      }
    },
    []
  );

  const toggleItemAvailability = useCallback(
    async (itemId: string) => {
      const target = menu.find((m) => m.itemId === itemId);
      if (!target) return;
      try {
        const updated = await apiClient.updateMenuItem({
          ...target,
          available: !target.available,
        });
        setMenu((prev) => prev.map((m) => (m.itemId === itemId ? updated : m)));
      } catch (err) {
        console.error('Failed to toggle availability:', err);
      }
    },
    [menu]
  );

  const addMenuItem = useCallback(
    async (item: Omit<MenuItem, 'itemId' | 'createdAt' | 'updatedAt'>) => {
      try {
        const created = await apiClient.createMenuItem(item);
        setMenu((prev) => [...prev, created]);
      } catch (err) {
        console.error('Failed to add menu item:', err);
      }
    },
    []
  );

  const updateMenuItem = useCallback(
    async (item: MenuItem) => {
      try {
        const updated = await apiClient.updateMenuItem(item);
        setMenu((prev) => prev.map((m) => (m.itemId === item.itemId ? updated : m)));
      } catch (err) {
        console.error('Failed to update menu item:', err);
      }
    },
    []
  );

  const deleteMenuItem = useCallback(
    async (itemId: string) => {
      try {
        await apiClient.deleteMenuItem(itemId);
        setMenu((prev) => prev.filter((m) => m.itemId !== itemId));
      } catch (err) {
        console.error('Failed to delete menu item:', err);
      }
    },
    []
  );

  // Category operations
  const addCategory = useCallback(
    async (cat: Omit<Category, 'categoryId'>) => {
      try {
        const created = await apiClient.createCategory(cat as any);
        setCategories((prev) => [...prev, created]);
      } catch (err) {
        console.error('Failed to add category:', err);
      }
    },
    []
  );

  const updateCategory = useCallback(
    async (cat: Category) => {
      try {
        const updated = await apiClient.updateCategory(cat);
        setCategories((prev) =>
          prev.map((c) => (c.categoryId === cat.categoryId ? updated : c))
        );
      } catch (err) {
        console.error('Failed to update category:', err);
      }
    },
    []
  );

  const deleteCategory = useCallback(
    async (catId: string) => {
      try {
        await apiClient.deleteCategory(catId);
        setCategories((prev) => prev.filter((c) => c.categoryId !== catId));
      } catch (err) {
        console.error('Failed to delete category:', err);
      }
    },
    []
  );

  // Settings
  const updateSettings = useCallback(
    async (newSettings: Partial<AppSettings>) => {
      try {
        const updated = await apiClient.updateSettings(newSettings);
        setSettings(updated as AppSettings);
      } catch (err) {
        console.error('Failed to update settings:', err);
      }
    },
    []
  );

  const exportExcelDatabase = useCallback(() => {
    apiClient.exportExcelWorkbook();
  }, []);

  const importExcelDatabase = useCallback(
    async (_file: File) => {
      alert('Importing external Excel files can be uploaded directly into the /data/ directory.');
    },
    []
  );

  const resetToDefaults = useCallback(() => {
    refreshData();
  }, [refreshData]);

  return (
    <AppContext.Provider
      value={{
        menu,
        categories,
        orders: rankedOrders,
        settings,
        cart,
        activeCategory,
        excelSync,
        nowTick,

        setActiveCategory,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        updateCartNotes,
        clearCart,
        placeOrder,

        completeOrderItemUnit,
        undoOrderItemUnit,
        updateOrderStatus,
        cancelOrder,
        markDelivered,
        generateDemoOrders,

        updateItemPrice,
        toggleItemAvailability,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        addCategory,
        updateCategory,
        deleteCategory,

        updateSettings,
        exportExcelDatabase,
        importExcelDatabase,
        resetToDefaults,
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
