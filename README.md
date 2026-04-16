# 🚀 CRM System - Lead to Delivery Automation

## 📌 Overview
This is a fully automated CRM (Customer Relationship Management) system designed to manage the complete business cycle from **Lead Generation → Follow-up → Quotation → Payment → Delivery**.

The system is **role-based**, **approval-driven**, and **dynamic**, ensuring proper workflow control and transparency across departments.

## � Live Demo

🔗 **[https://dev.anocabapp.com/](https://dev.anocabapp.com/)**

## �🎥 Demo Video

[![CRM Demo](https://img.shields.io/badge/Watch-Demo%20Video-red?style=for-the-badge&logo=youtube)](https://res.cloudinary.com/dngojnptn/video/upload/v1776323471/crm_screenrecording_aywwss.mp4)

[Click here to watch the full demo](https://res.cloudinary.com/dngojnptn/video/upload/v1776323471/crm_screenrecording_aywwss.mp4)

## 💡 Why This Project?

This CRM solves real-world business problems like:
- Manual lead tracking inefficiencies
- Lack of approval control in pricing
- Poor communication between departments
- Non-automated sales workflows

It provides a centralized, automated, and scalable solution.

## 🎯 Key Features

- 🔐 **Role-based access control**
- 🔄 **Complete lead lifecycle management**
- 📊 **Dynamic pricing calculator**
- 📦 **Product toolbox with full details**
- ✅ **Approval-based workflow system**
- 📧 **Automated follow-up emails**
- 💰 **Payment & PI (Proforma Invoice) tracking**
- 🚚 **Delivery tracking system**
- 🤖 **Ashvay AI** - Real-time learning AI assistant for query resolution
- 💬 **Internal chat system** with real-time communication

## 👥 User Roles

### 1. 🧠 Super Admin
- Full system access
- Create and manage departments
- Approves all major actions
- Controls system-level settings

### 2. 🏢 Department Head
- Manages department-level operations
- Reviews and approves salesperson activities
- Monitors team performance

### 3. 💼 Salesperson
- Handles leads and client interactions
- Sends follow-up emails
- Generates quotations & PI
- Tracks payments and delivery status

## 🏗️ System Modules

### 📌 1. Lead Management
- Add new leads
- Track status (New → Follow-up → Converted)
- Maintain client history

### 📌 2. Follow-up System
- Automated email reminders
- Activity tracking

### 📌 3. Quotation & PI Module
- Generate dynamic quotations
- Create Proforma Invoices
- Approval required before sending

### 📌 4. Payment Module
- Track payments received/pending
- Link with invoices

### 📌 5. Delivery Module
- Manage dispatch & delivery status

### 📌 6. 🧰 Toolbox (Core Feature)
- Product database with full details
- Dynamic pricing calculator
- Rate-based calculation system
- Fully approval-based updates

### 📌 7. 🤖 Ashvay AI Assistant
- Real-time query resolution
- Learns from interactions
- Context-aware responses
- Integrated chat interface

## 🔄 Workflow (End-to-End)

```
Lead Created
    ↓
Follow-up Initiated
    ↓
Quotation Generated
    ↓
Approval by Department Head / Admin
    ↓
PI Generated
    ↓
Payment Received
    ↓
Order Processed
    ↓
Delivery Completed
```

## 💡 Tech Stack

- **Frontend Framework:** React 18.2
- **Build Tool:** Vite 7.1
- **State Management:** Redux Toolkit, React Query
- **Styling:** Tailwind CSS
- **UI Components:** Lucide React, Framer Motion
- **Charts:** Chart.js, Recharts
- **Real-time Communication:** Socket.io Client
- **Routing:** React Router DOM
- **Maps:** Leaflet, React Leaflet
- **File Processing:** XLSX, HTML2Canvas, HTML2PDF
- **Firebase:** Authentication & Cloud Services

## 📁 Folder Structure

```
FRONTEND/
├── public/
├── src/
│   ├── api/                    # API integration layer
│   ├── components/             # Reusable components
│   │   ├── accounts/          # Account-related components
│   │   ├── chat/              # Chat system components
│   │   ├── dashboard/         # Dashboard widgets
│   │   ├── inventory/         # Inventory management
│   │   ├── lead/              # Lead management components
│   │   ├── payment/           # Payment tracking
│   │   ├── reports/           # Report generation
│   │   ├── timeline/          # Customer timeline
│   │   ├── ui/                # UI primitives
│   │   ├── WorkOrder/         # Work order components
│   │   ├── AshvayChat.jsx     # AI Assistant component
│   │   ├── LeadTable.jsx      # Lead listing table
│   │   ├── QuotationPreview.jsx
│   │   └── ...
│   ├── config/                # Configuration files
│   ├── constants/             # App constants
│   ├── context/               # React context providers
│   ├── hooks/                 # Custom React hooks
│   ├── pages/                 # Page components
│   │   ├── Auth/              # Authentication pages
│   │   ├── SuperAdmin/        # Super admin dashboard
│   │   ├── SalesDepartmentHead/ # Department head pages
│   │   ├── salesperson/       # Salesperson pages
│   │   ├── accounts/          # Accounts pages
│   │   ├── Reports/           # Reports pages
│   │   ├── shared/            # Shared pages
│   │   └── MainDashboard.jsx
│   ├── services/              # API service layer
│   │   ├── LeadService.js
│   │   ├── QuotationService.js
│   │   ├── PIService.js
│   │   ├── PaymentTrackingAggregates.js
│   │   ├── ProductPriceService.js
│   │   └── ...
│   ├── store/                 # Redux store
│   ├── utils/                 # Utility functions
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.cjs
└── postcss.config.js
```

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/ashishu703/dev-CRM-front.git
cd dev-CRM-front
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:4500
VITE_SOCKET_URL=http://localhost:4500
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

4. **Start development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

6. **Preview production build**
```bash
npm run preview
```

## 🌐 Usage

1. **Login** as Super Admin / Department Head / Salesperson
2. **Perform operations** based on role access
3. **Follow approval-based workflow**
4. **Use Ashvay AI** for instant query resolution
5. **Track leads** from creation to delivery

## 🔐 Security

- Role-based access restrictions
- Protected routes
- Approval checkpoints
- JWT authentication
- Secure API communication

## 🔄 Approval System

Every critical step requires approval:
- ✅ Quotation
- ✅ Pricing updates
- ✅ Product changes

Ensures data accuracy and control.

## ✨ Current Features

- ✅ **Mobile Responsive Design** - Works seamlessly on all devices
- ✅ **Email Automation** - Automated follow-ups and notifications
- ✅ **Push Notifications** - Real-time alerts via Firebase
- ✅ **AI-based Lead Scoring** - Intelligent lead prioritization
- ✅ **Advanced Analytics** - Comprehensive dashboard with metrics

## 📈 Future Enhancements

- 🔮 Predictive sales forecasting
- 🌍 Multi-language support
- 📊 Advanced data visualization
- 🔗 Third-party CRM integrations
- 📱 Native mobile apps (iOS/Android)

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Ashish Kumar Upadhyay**

---

**Repository:** [https://github.com/ashishu703/dev-CRM-front.git](https://github.com/ashishu703/dev-CRM-front.git)

**Backend Repository:** [https://github.com/ashishu703/dev-CRM-Backend.git](https://github.com/ashishu703/dev-CRM-Backend.git)
