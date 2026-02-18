# Sudha Nepali POS System

A modern, feature-rich Point of Sale (POS) system built with Next.js 14, TypeScript, and Tailwind CSS. Designed for Nepali businesses with multi-language support, role-based access control, and specialized features for different business types.

## ✨ Features

### Core Features
- 🛒 **Modern POS Interface** - Fast, intuitive checkout experience
- 👥 **Multi-User Support** - Role-based access (Owner, Manager, Cashier, Staff)
- 🌐 **Bilingual** - English and Nepali language support
- 📦 **Inventory Management** - Real-time stock tracking
- 👤 **Customer Management** - Customer database with purchase history
- 💳 **Khata System** - Credit/debit ledger for customers
- 💰 **Expense Tracking** - Business expense management
- 📊 **Analytics Dashboard** - Sales reports and insights
- 🎨 **Category-Specific Features** - Tailored for different business types

### Restaurant-Specific Features
- 🍽️ **Table Mode** - Assign orders to specific tables
- 👨‍🍳 **Recipe Management** - Create recipes from raw materials
- 📋 **Ingredient Tracking** - Automatic inventory deduction
- 🎨 **Custom UI** - Orange-themed restaurant interface

### Business Categories Supported
- 🛒 Grocery Store
- 💊 Pharmacy
- 🍽️ Restaurant
- 🏪 Retail Shop
- 👕 Clothing Store
- 📱 Electronics
- 🏬 General Store

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sudha-nepali-pos.git
cd sudha-nepali-pos

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔐 Demo Credentials

### Owner (Full Access)
- Email: `owner@shudhanepali.com`
- Password: `password`

### Manager
- Email: `manager@shudhanepali.com`
- Password: `password`

### Cashier (PIN: 1234)
- Email: `cashier@shudhanepali.com`
- Password: `password`

### Staff
- Email: `staff@shudhanepali.com`
- Password: `password`

## 📱 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Deployment**: Vercel

## 🏗️ Project Structure

```
pos-system-enhancements/
├── app/
│   ├── dashboard/          # Dashboard pages
│   │   ├── pos/           # Point of Sale
│   │   ├── products/      # Product management
│   │   ├── recipes/       # Recipe management (restaurants)
│   │   ├── inventory/     # Inventory tracking
│   │   ├── customers/     # Customer management
│   │   ├── khata/         # Credit ledger
│   │   ├── expenses/      # Expense tracking
│   │   └── analytics/     # Reports & analytics
│   ├── login/             # Login page
│   └── register/          # Registration page
├── components/            # Reusable components
│   ├── ui/               # UI components (shadcn)
│   └── sidebar.tsx       # Navigation sidebar
├── lib/
│   ├── store.ts          # Zustand state management
│   ├── types.ts          # TypeScript types
│   └── api.ts            # API functions
└── hooks/                # Custom React hooks
```

## 🎯 Key Features Explained

### Role-Based Access Control
- **Owner**: Full system access, settings, user management
- **Manager**: Products, inventory, sales, reports
- **Cashier**: POS, customers, khata management
- **Staff**: Limited POS access

### Restaurant Table Mode
1. Enable during signup for restaurant category
2. Set total number of tables
3. Assign table numbers to orders in POS
4. Track orders by table

### Recipe Management
1. Mark products as raw materials
2. Create recipes linking finished products to ingredients
3. Set yield quantities
4. Automatic inventory deduction on sales

### Khata (Credit System)
- Track customer credit/debit
- Payment history
- Outstanding balance tracking
- Approval workflow for cashiers

## 🌐 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/sudha-nepali-pos)

Or manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables
No environment variables required for demo. For production:
- Add database connection strings
- Configure authentication providers
- Set up payment gateways

## 📝 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@shudhanepali.com or open an issue on GitHub.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

Made with ❤️ for Nepali businesses
