import type { OrderData, OrderItemData } from '../providers/DataProvider.js';

export function normalizeIndianPhone(phone?: string): string | null {
  if (!phone) return null;
  const val = String(phone)
    .trim()
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '');

  if (/^\+91[6-9]\d{9}$/.test(val)) return val;
  if (/^91[6-9]\d{9}$/.test(val)) return '+' + val;
  if (/^[6-9]\d{9}$/.test(val)) return '+91' + val;

  return null;
}

export function buildItemsBreakup(items: OrderItemData[]): string {
  if (!items || !Array.isArray(items) || items.length === 0) return '';
  return items
    .map((item) => {
      const qty = Number(item.quantity || 1);
      const price = Number(item.unitPrice || 0);
      const total = qty * price;
      return `${qty} × ${item.itemName} — ₹${total.toFixed(2)}`;
    })
    .join('\n');
}

export function formatOrderDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return String(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = String(hours).padStart(2, '0');
    return `${day} ${month} ${year}, ${hoursStr}:${minutes} ${ampm}`;
  } catch {
    return String(dateStr);
  }
}

export async function sendWhatsAppOrderConfirmation(order: OrderData): Promise<any> {
  const phone = normalizeIndianPhone(order.customerPhone);
  if (!phone) {
    console.log(`[WhatsAppService] Skipping WhatsApp: phone number empty or invalid (${order.customerPhone})`);
    return null;
  }

  const itemsBreakup = buildItemsBreakup(order.items || []);
  const formattedDate = formatOrderDate(order.createdAt);
  const formattedTotal = Number(order.grandTotal || 0).toFixed(2);

  const variables = [
    order.customerName || 'Customer',
    itemsBreakup,
    order.orderNumber || order.orderId,
    formattedDate,
    formattedTotal,
  ];

  const payload = {
    to: phone,
    template_name: 'order_con',
    language_code: 'en_US',
    variables: variables,
  };

  const WHAPTER_URL = 'https://www.whapter.com/api/trigger/7cfc0444-c1c7-44a8-aa17-2b6eb437f818/send';
  const API_KEY = '18d05eaaf1c97e8d74ae42719f5c92d72ea399b82436c6b8479d3204f0d93ae1';

  try {
    console.log(`[WhatsAppService] Sending WhatsApp to ${phone} for Order ${order.orderNumber || order.orderId}...`);
    const res = await fetch(WHAPTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const resText = await res.text();
    console.log(`[WhatsAppService] Whapter HTTP ${res.status}: ${resText.slice(0, 300)}`);
    return { status: res.status, body: resText };
  } catch (err: any) {
    console.warn(`[WhatsAppService] WhatsApp request error: ${err.message}`);
    return null;
  }
}
