import type { Category } from '../types/menu';

export const INITIAL_CATEGORIES: Category[] = [
  { categoryId: 'cat-burgers', categoryName: 'BURGERS', displayOrder: 1, active: true },
  { categoryId: 'cat-fries', categoryName: 'FRENCH FRIES', displayOrder: 2, active: true },
  { categoryId: 'cat-momos', categoryName: 'MOMOS', displayOrder: 3, active: true },
  { categoryId: 'cat-fried-chicken', categoryName: 'FRIED CHICKEN QUICK BITES', displayOrder: 4, active: true },
  { categoryId: 'cat-rolls', categoryName: 'ROLLS N WRAPS', displayOrder: 5, active: true },
  { categoryId: 'cat-veg-bites', categoryName: 'VEG QUICK BITES', displayOrder: 6, active: true },
  { categoryId: 'cat-shawarma', categoryName: 'SHAWARMAS', displayOrder: 7, active: true },
  { categoryId: 'cat-mojitos', categoryName: 'MOJITOS', displayOrder: 8, active: true },
  { categoryId: 'cat-desserts', categoryName: 'DESSERTS', displayOrder: 9, active: true },
];
