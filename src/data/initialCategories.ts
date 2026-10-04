import type { Category } from '../types/menu';

export const INITIAL_CATEGORIES: Category[] = [
  { categoryId: 'cat_burgers', categoryName: 'BURGERS', displayOrder: 1, active: true },
  { categoryId: 'cat_fries', categoryName: 'FRENCH FRIES', displayOrder: 2, active: true },
  { categoryId: 'cat_momos', categoryName: 'MOMOS', displayOrder: 3, active: true },
  { categoryId: 'cat_fried_chicken', categoryName: 'FRIED CHICKEN QUICK BITES', displayOrder: 4, active: true },
  { categoryId: 'cat_rolls', categoryName: 'ROLLS N WRAPS', displayOrder: 5, active: true },
  { categoryId: 'cat_veg_bites', categoryName: 'VEG QUICK BITES', displayOrder: 6, active: true },
  { categoryId: 'cat_shawarma', categoryName: 'SHAWARMAS', displayOrder: 7, active: true },
  { categoryId: 'cat_mojitos', categoryName: 'MOJITOS', displayOrder: 8, active: true },
  { categoryId: 'cat_desserts', categoryName: 'DESSERTS', displayOrder: 9, active: true },
];
