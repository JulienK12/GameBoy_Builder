# 🎮 Game Boy Color Configurator (Rayboy)

A high-end, interactive 3D configurator for custom Game Boy Color consoles. Build your dream handheld with a real-time price calculator and high-fidelity 3D visualization.

![Rust](https://img.shields.io/badge/backend-Rust-orange?style=for-the-badge&logo=rust)
![Vue.js](https://img.shields.io/badge/frontend-Vue.js-green?style=for-the-badge&logo=vue.js)
![PostgreSQL](https://img.shields.io/badge/db-PostgreSQL-blue?style=for-the-badge&logo=postgresql)

## ✨ Features

- **Dynamic Catalog**: Over 70 shell variants, 15 screen types, and 20+ lens options loaded directly from PostgreSQL.
- **Real-time Quote**: Instant price calculation including parts and labor services.
- **3D Preview**: High-quality 3D visualization using Three.js (TresJS), allowing you to see your color choices in real-time.
- **Compatibility Engine**: Intelligent logic to ensure your selected parts are compatible (e.g., IPS screens vs. standard shells).
- **Retro-Premium UI**: 
  - Modern "Glassmorphism" interface with a neon-cyberpunk aesthetic.
  - **Advanced Filtering**: Filter by Brand, Technology (IPS/Laminated), and Mold type.
  - **Interactive Details**: Rich tooltips and hover effects for component inspection.
  - **Mobile Optimized**: Responsive layout for on-the-go configuration.
- **Quality Assurance**: Automated UI testing suite (Playwright) ensuring robust interactions.

## 🛠 Tech Stack

### Backend
- **Language**: Rust
- **Framework**: Axum (HTTP Server)
- **Database**: PostgreSQL with SQLx (Async SQL toolkit)
- **Features**: REST API, Static file serving (images), Quote calculation logic.

### Frontend
- **Framework**: Vue.js 3 (Composition API)
- **State Management**: Pinia
- **3D Engine**: TresJS (Three.js for Vue)
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites
- [Rust](https://www.rust-lang.org/) (Latest stable)
- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/) (Service running on default port 5432)

### 1. Database Setup
Create a database named `gameboy_configurator` and configure your `.env` file:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost/gameboy_configurator
```
Run migrations to set up the schema (if using sqlx-cli):
```bash
sqlx migrate run
```

### 2. Run the Backend
```bash
# From the root directory
cargo run
```
The API will be available at `http://localhost:3000`.

### 3. Run the Frontend
```bash
# In a new terminal
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

## 📂 Project Structure

```bash
gameboy_builder/
├── src/                # Backend Rust source code
│   ├── api/            # API Handlers and Routing
│   ├── data/           # Database interaction and Catalog loading
│   └── models/         # Data structures (Product, Variant, Enum)
├── frontend/           # Vue.js application
│   ├── src/
│   │   ├── components/ # UI Components (3D & Selectors)
│   │   ├── stores/     # Pinia State (Configurator state)
│   │   └── api/        # Axios API clients
│   └── public/models/  # 3D GLB Models
├── assets/images/      # Product images served by the backend
├── migrations/         # SQL database migrations
└── data/               # Source CSV files (for initial seeding)
```

## 📜 Documentation

- [PRD.md](file:///c:/Users/Julien/OneDrive/Rayboy/dev/gameboy_builder/PRD.md) - Product Requirements & Progress Tracking.
- [FRONTEND_INSTRUCTIONS.md](file:///c:/Users/Julien/OneDrive/Rayboy/dev/gameboy_builder/FRONTEND_INSTRUCTIONS.md) - Technical guide for the frontend implementation.

## 📝 License
Proprietary - Rayboy Project.
