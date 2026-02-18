'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, RotateCcw, Download } from 'lucide-react';
import { generateSKU, formatSKUForDisplay } from '@/lib/barcode';

interface BarcodeGeneratorProps {
  onSkuChange?: (sku: string) => void;
  initialSku?: string;
  allowManualInput?: boolean;
}

export function BarcodeGenerator({
  onSkuChange,
  initialSku = '',
  allowManualInput = true,
}: BarcodeGeneratorProps) {
  const [sku, setSku] = useState(initialSku || generateSKU());
  const [displaySku, setDisplaySku] = useState(formatSKUForDisplay(sku));
  const [copied, setCopied] = useState(false);
  const barcodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDisplaySku(formatSKUForDisplay(sku));
    onSkuChange?.(sku);
  }, [sku, onSkuChange]);

  // Dynamically load JsBarcode library
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js';
    script.async = true;
    script.onload = () => {
      if (window.JsBarcode) {
        window.JsBarcode(`#barcode-${sku}`, sku.replace(/-/g, ''), {
          format: 'CODE128',
          width: 2,
          height: 50,
          displayValue: false,
        });
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [sku]);

  function handleGenerate() {
    const newSku = generateSKU();
    setSku(newSku);
  }

  function handleCopy() {
    navigator.clipboard.writeText(sku);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const canvas = document.querySelector(`#barcode-${sku}`) as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `barcode-${sku}.png`;
      link.click();
    }
  }

  return (
    <div className="space-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
      <div>
        <Label className="text-sm font-medium text-slate-700">SKU / Barcode</Label>
        <p className="text-xs text-slate-600 mt-1">Auto-generated or manually enter</p>
      </div>

      <div className="flex gap-2">
        <Input
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          placeholder="Enter or generate SKU"
          disabled={!allowManualInput}
          className="text-sm font-mono"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          className="whitespace-nowrap"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="whitespace-nowrap"
        >
          <Copy className="h-4 w-4" />
          {copied && <span className="text-xs ml-1">Copied!</span>}
        </Button>
      </div>

      {/* Barcode Preview */}
      <div
        ref={barcodeRef}
        className="flex flex-col items-center p-3 bg-white border border-slate-200 rounded"
      >
        <svg id={`barcode-${sku}`} className="w-full"></svg>
        <p className="text-xs text-slate-600 mt-2 font-mono">{displaySku}</p>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDownload}
        className="w-full"
      >
        <Download className="h-4 w-4 mr-2" />
        Download Barcode Label
      </Button>
    </div>
  );
}

// Type declaration for JsBarcode
declare global {
  interface Window {
    JsBarcode?: any;
  }
}
