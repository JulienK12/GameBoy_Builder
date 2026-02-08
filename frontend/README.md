
# RayBoy.92 - Gameboy Color Configurator 3D

A premium, interactive 3D configurator for customizing Gameboy Color consoles. Built with Vue 3, Three.js (TresJS), and TailwindCSS.

![RayBoy.92 Preview](https://via.placeholder.com/800x450?text=RayBoy.92+Preview) 
*(Note: Replace with actual screenshot)*

## Features

- **Interactive 3D Preview**: Real-time rendering of the console with accurate colors and materials.
- **Customizable Parts**:
  - **Shells**: Various colors, transparent options, and brands (FunnyPlaying, Cloud Game Store).
  - **Screens**: IPS, Laminated, and OEM options.
  - **Lenses**: Standard and Large sizes, custom designs.
  - **Buttons**: Customize A/B, D-Pad, and Start/Select buttons independently.
- **Compatibility Check**: Smart logic to warn about incompatible combinations (e.g., standard shell + laminated screen).
- **Responsive Design**: Optimized for both desktop (immersive 3D view) and mobile (touch-friendly interface).
- **Price Calculation**: Real-time cost estimation based on selected components.

## Tech Stack

- **Frontend Framework**: Vue 3 (Composition API)
- **State Management**: Pinia
- **3D Rendering**: Three.js + TresJS (Vue wrapper for Three.js)
- **Styling**: TailwindCSS
- **Build Tool**: Vite

## Project Structure

```
frontend/
├── src/
│   ├── api/            # Mock API calls and data services
│   ├── assets/         # Static assets (icons, images)
│   ├── components/     # Vue components
│   │   ├── 3D/         # 3D-related components (Scene, Models)
│   │   ├── Gallery/    # UI components for the parts gallery
│   │   └── ...         # other UI components
│   ├── stores/         # Pinia store (configuration state)
│   ├── App.vue         # Main application layout
│   └── main.js         # Entry point
└── public/             # Public assets (3D models, textures)
```

## Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/gameboy-builder.git
    cd gameboy-builder/frontend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  **Build for production**:
    ```bash
    npm run build
    ```

## Development Notes

- **3D Models**: The app expects GLB/GLTF models in the `public/models` directory. The mapping logic is handled in `src/components/3D/ModelMapper.vue`.
- **Data**: Product data (shells, screens, etc.) is currently mocked in `src/api/backend.js` but structured to be easily replaced by a real backend API.

## License

[MIT](LICENSE)
