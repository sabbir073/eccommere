export function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

export function calculateShippingCost(city: string): number {
  const dhakaCities = ['dhaka', 'ঢাকা'];
  const isDhaka = dhakaCities.some(c => city.toLowerCase().includes(c));

  return isDhaka
    ? parseInt(process.env.SHIPPING_INSIDE_DHAKA || '80')
    : parseInt(process.env.SHIPPING_OUTSIDE_DHAKA || '150');
}

export function formatPrice(price: number): string {
  return `৳${price.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
}

export function calculateDiscount(price: number, comparePrice?: number): number {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

export function isInStock(product: { stock_quantity: number }): boolean {
  return product.stock_quantity > 0;
}

export function isLowStock(product: { stock_quantity: number; low_stock_threshold: number }): boolean {
  return product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
