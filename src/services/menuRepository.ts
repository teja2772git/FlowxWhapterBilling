import type { MenuItem, Category } from '../types/menu';

export class MenuRepository {
  private menu: MenuItem[];
  private categories: Category[];
  private onDataChanged: () => void;

  constructor(initialMenu: MenuItem[], initialCategories: Category[], onDataChanged: () => void) {
    this.menu = initialMenu;
    this.categories = initialCategories;
    this.onDataChanged = onDataChanged;
  }

  public updateData(menu: MenuItem[], categories: Category[]) {
    this.menu = menu;
    this.categories = categories;
  }

  public getMenu(): MenuItem[] {
    return [...this.menu].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public getCategories(): Category[] {
    return [...this.categories].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public addMenuItem(newItem: Omit<MenuItem, 'itemId' | 'createdAt' | 'updatedAt'>): MenuItem {
    const now = new Date().toISOString();
    const item: MenuItem = {
      ...newItem,
      itemId: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.menu.push(item);
    this.onDataChanged();
    return item;
  }

  public updateMenuItem(updatedItem: MenuItem): MenuItem {
    const idx = this.menu.findIndex((m) => m.itemId === updatedItem.itemId);
    if (idx !== -1) {
      this.menu[idx] = {
        ...updatedItem,
        updatedAt: new Date().toISOString(),
      };
      this.onDataChanged();
      return this.menu[idx];
    }
    throw new Error(`Menu item with ID ${updatedItem.itemId} not found.`);
  }

  public updatePrice(itemId: string, newPrice: number): MenuItem {
    if (isNaN(newPrice) || newPrice < 0) {
      throw new Error('Invalid price value.');
    }
    const idx = this.menu.findIndex((m) => m.itemId === itemId);
    if (idx !== -1) {
      this.menu[idx] = {
        ...this.menu[idx],
        price: newPrice,
        updatedAt: new Date().toISOString(),
      };
      this.onDataChanged();
      return this.menu[idx];
    }
    throw new Error(`Menu item with ID ${itemId} not found.`);
  }

  public toggleAvailability(itemId: string): MenuItem {
    const idx = this.menu.findIndex((m) => m.itemId === itemId);
    if (idx !== -1) {
      this.menu[idx] = {
        ...this.menu[idx],
        available: !this.menu[idx].available,
        updatedAt: new Date().toISOString(),
      };
      this.onDataChanged();
      return this.menu[idx];
    }
    throw new Error(`Menu item with ID ${itemId} not found.`);
  }

  public deleteMenuItem(itemId: string): void {
    this.menu = this.menu.filter((m) => m.itemId !== itemId);
    this.onDataChanged();
  }

  public addCategory(newCategory: Omit<Category, 'categoryId'>): Category {
    const cat: Category = {
      ...newCategory,
      categoryId: `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    this.categories.push(cat);
    this.onDataChanged();
    return cat;
  }

  public updateCategory(updatedCategory: Category): Category {
    const idx = this.categories.findIndex((c) => c.categoryId === updatedCategory.categoryId);
    if (idx !== -1) {
      this.categories[idx] = updatedCategory;
      this.menu = this.menu.map((item) => {
        if (item.categoryId === updatedCategory.categoryId) {
          return { ...item, categoryName: updatedCategory.categoryName };
        }
        return item;
      });
      this.onDataChanged();
      return this.categories[idx];
    }
    throw new Error(`Category with ID ${updatedCategory.categoryId} not found.`);
  }

  public deleteCategory(categoryId: string): void {
    this.categories = this.categories.filter((c) => c.categoryId !== categoryId);
    this.menu = this.menu.filter((m) => m.categoryId !== categoryId);
    this.onDataChanged();
  }
}
