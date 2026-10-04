import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const BACKUP_DIR = path.resolve(DATA_DIR, 'backups');
const WORKBOOK_PATH = path.resolve(DATA_DIR, 'FLOW_POS.xlsx');

// Ensure mutex lock for concurrent write safety
class Mutex {
  private queue: Array<() => void> = [];
  private locked = false;

  async acquire(): Promise<() => void> {
    return new Promise((resolve) => {
      const release = () => {
        if (this.queue.length > 0) {
          const next = this.queue.shift()!;
          next();
        } else {
          this.locked = false;
        }
      };

      if (this.locked) {
        this.queue.push(() => resolve(release));
      } else {
        this.locked = true;
        resolve(release);
      }
    });
  }
}

const fileMutex = new Mutex();

export class ExcelService {
  private static instance: ExcelService;

  private constructor() {
    this.ensureDirectoryStructure();
    this.initializeWorkbookIfNeeded();
  }

  public static getInstance(): ExcelService {
    if (!ExcelService.instance) {
      ExcelService.instance = new ExcelService();
    }
    return ExcelService.instance;
  }

  private ensureDirectoryStructure(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
  }

  public initializeWorkbookIfNeeded(): void {
    if (fs.existsSync(WORKBOOK_PATH)) {
      return;
    }

    console.log('[ExcelService] FLOW_POS.xlsx not found. Creating initial workbook...');

    const now = new Date().toISOString();

    // 1. CATEGORIES SHEET DATA
    const categories = [
      { categoryId: 'cat_burgers', categoryName: 'BURGERS', displayOrder: 1, active: 'TRUE', createdAt: now, updatedAt: now },
      { categoryId: 'cat_fries', categoryName: 'FRENCH FRIES', displayOrder: 2, active: 'TRUE', createdAt: now, updatedAt: now },
      { categoryId: 'cat_momos', categoryName: 'MOMOS', displayOrder: 3, active: 'TRUE', createdAt: now, updatedAt: now },
      { categoryId: 'cat_fried_chicken', categoryName: 'FRIED CHICKEN QUICK BITES', displayOrder: 4, active: 'TRUE', createdAt: now, updatedAt: now },
      { categoryId: 'cat_rolls', categoryName: 'ROLLS N WRAPS', displayOrder: 5, active: 'TRUE', createdAt: now, updatedAt: now },
      { categoryId: 'cat_veg_bites', categoryName: 'VEG QUICK BITES', displayOrder: 6, active: 'TRUE', createdAt: now, updatedAt: now },
      { categoryId: 'cat_shawarma', categoryName: 'SHAWARMA', displayOrder: 7, active: 'TRUE', createdAt: now, updatedAt: now },
      { categoryId: 'cat_mojitos', categoryName: 'MOJITOS', displayOrder: 8, active: 'TRUE', createdAt: now, updatedAt: now },
      { categoryId: 'cat_desserts', categoryName: 'DESSERTS', displayOrder: 9, active: 'TRUE', createdAt: now, updatedAt: now },
    ];

    // 2. MENU SHEET DATA
    const menu = [
      // BURGERS
      { itemId: 'item_burger_001', categoryId: 'cat_burgers', categoryName: 'BURGERS', itemName: 'Classic Veg Burger', price: 120, available: 'TRUE', displayOrder: 1, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_burger_002', categoryId: 'cat_burgers', categoryName: 'BURGERS', itemName: 'Veg Cheese Burger', price: 150, available: 'TRUE', displayOrder: 2, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_burger_003', categoryId: 'cat_burgers', categoryName: 'BURGERS', itemName: 'Crispy Chicken Patty Burger', price: 150, available: 'TRUE', displayOrder: 3, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_burger_004', categoryId: 'cat_burgers', categoryName: 'BURGERS', itemName: 'Chicken Cheese Burger', price: 180, available: 'TRUE', displayOrder: 4, notes: '', createdAt: now, updatedAt: now },

      // FRENCH FRIES
      { itemId: 'item_fries_001', categoryId: 'cat_fries', categoryName: 'FRENCH FRIES', itemName: 'Regular', price: 120, available: 'TRUE', displayOrder: 1, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_fries_002', categoryId: 'cat_fries', categoryName: 'FRENCH FRIES', itemName: 'Loaded Fries (Veg)', price: 150, available: 'TRUE', displayOrder: 2, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_fries_003', categoryId: 'cat_fries', categoryName: 'FRENCH FRIES', itemName: 'Loaded Fries (Chicken)', price: 200, available: 'TRUE', displayOrder: 3, notes: '', createdAt: now, updatedAt: now },

      // MOMOS
      { itemId: 'item_momo_001', categoryId: 'cat_momos', categoryName: 'MOMOS', itemName: 'Veg Steamed Momos', price: 120, available: 'TRUE', displayOrder: 1, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_momo_002', categoryId: 'cat_momos', categoryName: 'MOMOS', itemName: 'Paneer Steamed Momos', price: 140, available: 'TRUE', displayOrder: 2, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_momo_003', categoryId: 'cat_momos', categoryName: 'MOMOS', itemName: 'Chicken Steamed Momos', price: 140, available: 'TRUE', displayOrder: 3, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_momo_004', categoryId: 'cat_momos', categoryName: 'MOMOS', itemName: 'Veg Fried Momos', price: 140, available: 'TRUE', displayOrder: 4, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_momo_005', categoryId: 'cat_momos', categoryName: 'MOMOS', itemName: 'Paneer Fried Momos', price: 160, available: 'TRUE', displayOrder: 5, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_momo_006', categoryId: 'cat_momos', categoryName: 'MOMOS', itemName: 'Chicken Fried Momos', price: 160, available: 'TRUE', displayOrder: 6, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_momo_007', categoryId: 'cat_momos', categoryName: 'MOMOS', itemName: 'Veg Kurkure Momos', price: 160, available: 'TRUE', displayOrder: 7, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_momo_008', categoryId: 'cat_momos', categoryName: 'MOMOS', itemName: 'Paneer Kurkure Momos', price: 180, available: 'TRUE', displayOrder: 8, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_momo_009', categoryId: 'cat_momos', categoryName: 'MOMOS', itemName: 'Chicken Kurkure Momos', price: 180, available: 'TRUE', displayOrder: 9, notes: '', createdAt: now, updatedAt: now },

      // FRIED CHICKEN QUICK BITES
      { itemId: 'item_fc_001', categoryId: 'cat_fried_chicken', categoryName: 'FRIED CHICKEN QUICK BITES', itemName: 'Chicken Popcorn (10 pcs)', price: 180, available: 'TRUE', displayOrder: 1, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_fc_002', categoryId: 'cat_fried_chicken', categoryName: 'FRIED CHICKEN QUICK BITES', itemName: 'Chicken Crunchy Bites (10 pcs)', price: 180, available: 'TRUE', displayOrder: 2, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_fc_003', categoryId: 'cat_fried_chicken', categoryName: 'FRIED CHICKEN QUICK BITES', itemName: 'Chicken Boneless Strips (5 pcs)', price: 180, available: 'TRUE', displayOrder: 3, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_fc_004', categoryId: 'cat_fried_chicken', categoryName: 'FRIED CHICKEN QUICK BITES', itemName: 'Chicken Wings (4 pcs)', price: 180, available: 'TRUE', displayOrder: 4, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_fc_005', categoryId: 'cat_fried_chicken', categoryName: 'FRIED CHICKEN QUICK BITES', itemName: 'Chicken Drumsticks (2 pcs)', price: 180, available: 'TRUE', displayOrder: 5, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_fc_006', categoryId: 'cat_fried_chicken', categoryName: 'FRIED CHICKEN QUICK BITES', itemName: 'Chicken Nuggets (6 pcs)', price: 180, available: 'TRUE', displayOrder: 6, notes: '', createdAt: now, updatedAt: now },

      // ROLLS N WRAPS
      { itemId: 'item_roll_001', categoryId: 'cat_rolls', categoryName: 'ROLLS N WRAPS', itemName: 'Veg Roll', price: 120, available: 'TRUE', displayOrder: 1, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_roll_002', categoryId: 'cat_rolls', categoryName: 'ROLLS N WRAPS', itemName: 'Paneer Grilled Roll', price: 150, available: 'TRUE', displayOrder: 2, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_roll_003', categoryId: 'cat_rolls', categoryName: 'ROLLS N WRAPS', itemName: 'Chicken Tikka Grilled Roll', price: 180, available: 'TRUE', displayOrder: 3, notes: '', createdAt: now, updatedAt: now },

      // VEG QUICK BITES
      { itemId: 'item_vb_001', categoryId: 'cat_veg_bites', categoryName: 'VEG QUICK BITES', itemName: 'Veg Cheese Balls (6 pcs)', price: 150, available: 'TRUE', displayOrder: 1, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_vb_002', categoryId: 'cat_veg_bites', categoryName: 'VEG QUICK BITES', itemName: 'Veg Cheese Nuggets (6 pcs)', price: 150, available: 'TRUE', displayOrder: 2, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_vb_003', categoryId: 'cat_veg_bites', categoryName: 'VEG QUICK BITES', itemName: 'Veg Nuggets (10 pcs)', price: 150, available: 'TRUE', displayOrder: 3, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_vb_004', categoryId: 'cat_veg_bites', categoryName: 'VEG QUICK BITES', itemName: 'Potato Smiles (10 pcs)', price: 150, available: 'TRUE', displayOrder: 4, notes: '', createdAt: now, updatedAt: now },

      // SHAWARMA
      { itemId: 'item_sh_001', categoryId: 'cat_shawarma', categoryName: 'SHAWARMA', itemName: 'Chicken Shawarma with Salad', price: 150, available: 'TRUE', displayOrder: 1, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_sh_002', categoryId: 'cat_shawarma', categoryName: 'SHAWARMA', itemName: 'Chicken Stuffed Flow Special Shawarma', price: 180, available: 'TRUE', displayOrder: 2, notes: '', createdAt: now, updatedAt: now },

      // MOJITOS
      { itemId: 'item_moj_001', categoryId: 'cat_mojitos', categoryName: 'MOJITOS', itemName: 'Ocean Blue Mojito', price: 100, available: 'TRUE', displayOrder: 1, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_moj_002', categoryId: 'cat_mojitos', categoryName: 'MOJITOS', itemName: 'Green Lemon & Mint Mojito', price: 100, available: 'TRUE', displayOrder: 2, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_moj_003', categoryId: 'cat_mojitos', categoryName: 'MOJITOS', itemName: 'Virgin Mojito', price: 100, available: 'TRUE', displayOrder: 3, notes: '', createdAt: now, updatedAt: now },

      // DESSERTS
      { itemId: 'item_des_001', categoryId: 'cat_desserts', categoryName: 'DESSERTS', itemName: 'Maska Bun', price: 100, available: 'TRUE', displayOrder: 1, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_des_002', categoryId: 'cat_desserts', categoryName: 'DESSERTS', itemName: 'Chocolate Donut', price: 80, available: 'TRUE', displayOrder: 2, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_des_003', categoryId: 'cat_desserts', categoryName: 'DESSERTS', itemName: 'Plain Donut', price: 50, available: 'TRUE', displayOrder: 3, notes: '', createdAt: now, updatedAt: now },
      { itemId: 'item_des_004', categoryId: 'cat_desserts', categoryName: 'DESSERTS', itemName: 'Flow Special Cakes', price: 150, available: 'TRUE', displayOrder: 4, notes: 'Based on availability', createdAt: now, updatedAt: now },
    ];

    // 3. ORDERS SHEET DATA
    const orders: any[] = [];

    // 4. ORDER_ITEMS SHEET DATA
    const orderItems: any[] = [];

    // 5. CUSTOMERS SHEET DATA
    const customers = [
      { customerId: 'cust_walkin', customerName: 'Walk-in Customer', phone: '', createdAt: now, updatedAt: now, totalOrders: 0, totalSpent: 0 }
    ];

    // 6. SETTINGS SHEET DATA
    const settings = [
      { key: 'restaurantName', value: 'FLOW — Flavours on Wheels', description: 'Restaurant display name' },
      { key: 'restaurantTagline', value: 'Food Truck • Café • Catering', description: 'Restaurant tagline' },
      { key: 'currency', value: 'INR', description: 'Currency code' },
      { key: 'currencySymbol', value: '₹', description: 'Currency symbol' },
      { key: 'taxEnabled', value: 'FALSE', description: 'GST tax calculation toggle' },
      { key: 'taxPercentage', value: '0', description: 'Tax percentage rate' },
      { key: 'priorityAgingWeight', value: '2.5', description: 'Smart priority aging weight factor' },
      { key: 'priorityWorkloadWeight', value: '1.2', description: 'Smart priority workload weight factor' },
      { key: 'priorityCompletionWeight', value: '1.8', description: 'Smart priority completion progress weight' },
      { key: 'antiStarvationThreshold', value: '25', description: 'Minutes before priority escalates to CRITICAL' },
    ];

    // 7. DAILY_SUMMARY SHEET DATA
    const dailySummary: any[] = [];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(categories), 'CATEGORIES');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(menu), 'MENU');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(orders), 'ORDERS');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(orderItems), 'ORDER_ITEMS');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(customers), 'CUSTOMERS');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(settings), 'SETTINGS');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dailySummary), 'DAILY_SUMMARY');

    XLSX.writeFile(wb, WORKBOOK_PATH);
    console.log('[ExcelService] FLOW_POS.xlsx successfully created at: ' + WORKBOOK_PATH);
  }

  public async readWorkbook(): Promise<XLSX.WorkBook> {
    const release = await fileMutex.acquire();
    try {
      this.ensureDirectoryStructure();
      this.initializeWorkbookIfNeeded();
      const buffer = fs.readFileSync(WORKBOOK_PATH);
      return XLSX.read(buffer, { type: 'buffer' });
    } finally {
      release();
    }
  }

  public async readSheet<T = any>(sheetName: string): Promise<T[]> {
    const wb = await this.readWorkbook();
    if (!wb.SheetNames.includes(sheetName)) {
      return [];
    }
    const ws = wb.Sheets[sheetName];
    return XLSX.utils.sheet_to_json<T>(ws);
  }

  public async writeWorkbook(wb: XLSX.WorkBook): Promise<void> {
    const release = await fileMutex.acquire();
    try {
      this.ensureDirectoryStructure();
      this.createBackup();
      XLSX.writeFile(wb, WORKBOOK_PATH);
    } finally {
      release();
    }
  }

  public async updateSheets(sheetsData: Record<string, any[]>): Promise<void> {
    const release = await fileMutex.acquire();
    try {
      this.ensureDirectoryStructure();
      this.createBackup();

      let wb: XLSX.WorkBook;
      if (fs.existsSync(WORKBOOK_PATH)) {
        const buffer = fs.readFileSync(WORKBOOK_PATH);
        wb = XLSX.read(buffer, { type: 'buffer' });
      } else {
        wb = XLSX.utils.book_new();
      }

      Object.entries(sheetsData).forEach(([sheetName, data]) => {
        const ws = XLSX.utils.json_to_sheet(data);
        if (wb.SheetNames.includes(sheetName)) {
          wb.Sheets[sheetName] = ws;
        } else {
          XLSX.utils.book_append_sheet(wb, ws, sheetName);
        }
      });

      XLSX.writeFile(wb, WORKBOOK_PATH);
    } finally {
      release();
    }
  }

  public createBackup(): void {
    if (!fs.existsSync(WORKBOOK_PATH)) return;

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.resolve(BACKUP_DIR, `FLOW_POS_${timestamp}.xlsx`);
      fs.copyFileSync(WORKBOOK_PATH, backupPath);

      // Keep only latest 10 backups
      const files = fs.readdirSync(BACKUP_DIR)
        .filter((f) => f.startsWith('FLOW_POS_') && f.endsWith('.xlsx'))
        .sort();

      while (files.length > 10) {
        const oldest = files.shift()!;
        fs.unlinkSync(path.resolve(BACKUP_DIR, oldest));
      }
    } catch (err) {
      console.error('[ExcelService] Failed to create backup:', err);
    }
  }

  public getWorkbookFilePath(): string {
    return WORKBOOK_PATH;
  }
}
