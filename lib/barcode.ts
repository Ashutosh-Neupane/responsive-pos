/**
 * Barcode Generation Utilities
 * Generates SKU and barcode data for products
 */

export interface BarcodeData {
  sku: string;
  barcodeValue: string;
  format: 'CODE128' | 'EAN13' | 'UPC';
  generatedAt: string;
}

/**
 * Generate a unique SKU
 * Format: YYYYMMDD-RANDOMHEX (e.g., 20250217-A1B2C3D4)
 */
export function generateSKU(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Generate random hex string
  const randomHex = Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 16).toString(16).toUpperCase()
  ).join('');
  
  return `${dateStr}-${randomHex}`;
}

/**
 * Generate barcode data from SKU
 * Returns data suitable for JsBarcode library
 */
export function generateBarcodeData(sku: string): BarcodeData {
  // For CODE128, we can use the SKU directly as it supports alphanumeric
  const barcodeValue = sku.replace(/-/g, ''); // Remove dash for barcode
  
  return {
    sku,
    barcodeValue,
    format: 'CODE128',
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Validate SKU format
 */
export function isValidSKU(sku: string): boolean {
  // Format: YYYYMMDD-RANDOMHEX or custom format
  return sku.length > 0 && sku.length <= 50;
}

/**
 * Format SKU for display with hyphens
 */
export function formatSKUForDisplay(sku: string): string {
  // If doesn't have hyphen, add one between first 8 and rest
  if (!sku.includes('-') && sku.length > 8) {
    return `${sku.slice(0, 8)}-${sku.slice(8)}`;
  }
  return sku;
}

/**
 * Generate a barcode ID for database storage
 */
export function generateBarcodeId(): string {
  return `barcode-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
