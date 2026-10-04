import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import * as path from 'path';
import { activeDataProvider } from './providers';
import { ExcelService } from './services/ExcelService';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize workbook on server startup
const excelService = ExcelService.getInstance();
excelService.initializeWorkbookIfNeeded();

// -----------------------------------------------------------------------------
// CATEGORIES ENDPOINTS
// -----------------------------------------------------------------------------
app.get('/api/categories', async (_req, res) => {
  try {
    const categories = await activeDataProvider.getCategories();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const newCat = await activeDataProvider.createCategory(req.body);
    res.status(201).json(newCat);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/categories/:categoryId', async (req, res) => {
  try {
    const updated = await activeDataProvider.updateCategory(req.params.categoryId, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/categories/:categoryId', async (req, res) => {
  try {
    const deleted = await activeDataProvider.deleteCategory(req.params.categoryId);
    res.json({ success: deleted });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// MENU ENDPOINTS
// -----------------------------------------------------------------------------
app.get('/api/menu', async (_req, res) => {
  try {
    const menu = await activeDataProvider.getMenuItems();
    res.json(menu);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/menu', async (req, res) => {
  try {
    const newItem = await activeDataProvider.createMenuItem(req.body);
    res.status(201).json(newItem);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/menu/:itemId', async (req, res) => {
  try {
    const updated = await activeDataProvider.updateMenuItem(req.params.itemId, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/menu/:itemId', async (req, res) => {
  try {
    const deleted = await activeDataProvider.deleteMenuItem(req.params.itemId);
    res.json({ success: deleted });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// ORDERS ENDPOINTS
// -----------------------------------------------------------------------------
app.get('/api/orders', async (_req, res) => {
  try {
    const orders = await activeDataProvider.getOrders();
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/active', async (_req, res) => {
  try {
    const active = await activeDataProvider.getActiveOrders();
    res.json(active);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const order = await activeDataProvider.getOrderById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { items, customerName, customerPhone, discount } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }
    const created = await activeDataProvider.createOrder(
      items,
      customerName,
      customerPhone,
      discount
    );
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/orders/:orderId', async (req, res) => {
  try {
    const updated = await activeDataProvider.updateOrder(req.params.orderId, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// ORDER ITEMS & ITEM COMPLETION ENDPOINTS
// -----------------------------------------------------------------------------
app.get('/api/orders/:orderId/items', async (req, res) => {
  try {
    const order = await activeDataProvider.getOrderById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order.items);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/order-items/:orderItemId/complete', async (req, res) => {
  try {
    const updatedOrder = await activeDataProvider.completeOrderItemUnit(req.params.orderItemId);
    res.json(updatedOrder);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/order-items/:orderItemId/undo', async (req, res) => {
  try {
    const updatedOrder = await activeDataProvider.undoOrderItemUnit(req.params.orderItemId);
    res.json(updatedOrder);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// CUSTOMERS ENDPOINTS
// -----------------------------------------------------------------------------
app.get('/api/customers', async (_req, res) => {
  try {
    const customers = await activeDataProvider.getCustomers();
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const created = await activeDataProvider.createCustomer(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/customers/:customerId', async (req, res) => {
  try {
    const updated = await activeDataProvider.updateCustomer(req.params.customerId, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// SETTINGS ENDPOINTS
// -----------------------------------------------------------------------------
app.get('/api/settings', async (_req, res) => {
  try {
    const settings = await activeDataProvider.getSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings/:key', async (req, res) => {
  try {
    const key = req.params.key;
    const { value } = req.body;
    const updated = await activeDataProvider.updateSettings({ [key]: value });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const updated = await activeDataProvider.updateSettings(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// DAILY SUMMARY ENDPOINT
// -----------------------------------------------------------------------------
app.get('/api/daily-summary', async (_req, res) => {
  try {
    const summary = await activeDataProvider.getDailySummary();
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// EXCEL FILE EXPORT & BACKUP ENDPOINTS
// -----------------------------------------------------------------------------
app.get('/api/export', (_req, res) => {
  try {
    const filePath = excelService.getWorkbookFilePath();
    res.download(filePath, 'FLOW_POS.xlsx');
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/backup', (_req, res) => {
  try {
    excelService.createBackup();
    res.json({ success: true, message: 'Backup created successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[FLOW Backend Server] Listening on http://localhost:${PORT}`);
    console.log(`[FLOW Backend Server] Data Provider: ${process.env.DATA_PROVIDER || 'excel'}`);
  });
}

export default app;

