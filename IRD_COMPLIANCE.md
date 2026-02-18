# IRD (Inland Revenue Department) Compliance - Nepal

## 🇳🇵 IRD Requirements for POS Systems in Nepal

### What is IRD Verification?
IRD (Inland Revenue Department) verification ensures that POS systems comply with Nepal's tax regulations and can generate proper tax invoices for VAT-registered businesses.

### Key Requirements:

#### 1. **Tax Invoice Format**
- **Invoice Number**: Sequential, unique invoice number
- **Date & Time**: Transaction date and time
- **Seller Information**:
  - Business Name
  - PAN (Permanent Account Number)
  - VAT Registration Number
  - Address
  - Phone Number
- **Buyer Information** (if available):
  - Customer Name
  - PAN (if VAT registered)
  - Address
- **Item Details**:
  - Description
  - Quantity
  - Unit Price
  - Taxable Amount
  - VAT Amount (13% in Nepal)
  - Total Amount
- **Summary**:
  - Subtotal (before VAT)
  - Total VAT Amount
  - Discount (if any)
  - Grand Total
- **Payment Method**
- **Signature/Stamp** (for printed invoices)

#### 2. **VAT Calculation**
- Standard VAT Rate: **13%**
- Formula: `VAT = (Taxable Amount × 13) / 100`
- Display both inclusive and exclusive amounts

#### 3. **Invoice Numbering**
- Format: `INV-YYYY-XXXXXX` or `SALE-YYYYMMDD-XXX`
- Must be sequential and non-repeating
- No gaps in sequence

#### 4. **Record Keeping**
- All invoices must be stored for **6 years**
- Digital backup required
- Audit trail for all transactions

#### 5. **Sales Reports**
- Daily sales summary
- Monthly VAT report
- Purchase and sales ledger
- Stock register

#### 6. **Real-time Fiscal Device (Optional but Recommended)**
- Electronic Fiscal Device (EFD) integration
- Real-time data transmission to IRD
- Tamper-proof transaction recording

### Implementation Checklist:

- [x] Proper invoice format with all required fields
- [x] VAT calculation (13%)
- [x] Sequential invoice numbering
- [x] Business PAN/VAT number fields
- [x] Customer PAN field (optional)
- [x] Discount handling
- [x] Payment method tracking
- [ ] Digital signature (future)
- [ ] EFD integration (future)
- [ ] IRD API integration (future)

### Invoice Sample Format:

```
═══════════════════════════════════════════════════════
                    TAX INVOICE
═══════════════════════════════════════════════════════

Business Name: Sudha Nepali Restaurant
PAN: 123456789
VAT No: 987654321
Address: Kathmandu, Nepal
Phone: +977-1-4123456

Invoice No: INV-2024-000123
Date: 2024-01-15 14:30:25
Table: 5

Customer: Walk-in Customer
PAN: N/A

───────────────────────────────────────────────────────
Item                    Qty    Rate    Amount
───────────────────────────────────────────────────────
Chicken Momo           2 plate  250.00   500.00
Chowmein              1 plate  180.00   180.00
Coke                  2 bottle  60.00   120.00
───────────────────────────────────────────────────────

Subtotal (Taxable):                      800.00
Discount (10%):                          -80.00
                                        -------
Net Taxable Amount:                      720.00
VAT (13%):                                93.60
                                        -------
GRAND TOTAL:                         Rs 813.60
═══════════════════════════════════════════════════════

Payment Method: Cash
Paid Amount: Rs 1000.00
Change: Rs 186.40

Thank you for your visit!
Visit again!

───────────────────────────────────────────────────────
This is a computer-generated invoice.
For queries: info@sudhanepal.com
═══════════════════════════════════════════════════════
```

### Penalties for Non-Compliance:
- Fine up to NPR 100,000
- Business closure
- Legal action

### Resources:
- IRD Nepal: https://ird.gov.np
- VAT Act 2052
- Income Tax Act 2058

## Implementation in POS System:

1. **Shop Settings**: Add PAN and VAT registration fields
2. **Invoice Generation**: Include all IRD-required fields
3. **VAT Calculation**: Automatic 13% VAT on all items
4. **Reports**: Generate IRD-compliant reports
5. **Backup**: Automatic daily backup of all transactions
