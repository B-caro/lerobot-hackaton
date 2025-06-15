# Visualizador de Datasets de Hugging Face (LeRobot)

Este proyecto es una aplicación web para explorar y visualizar datasets públicos del usuario **lerobot** en Hugging Face. Permite buscar, filtrar y navegar entre los datasets, así como ver detalles visuales y metadatos de cada uno con una experiencia moderna y atractiva.

## Características principales
- Listado visual y moderno de todos los datasets públicos de `lerobot` en Hugging Face
- Buscador predictivo/autocompletado con diseño contemporáneo e iconografía
- Visualización de detalles y metadatos clave en tarjetas con iconos y gradientes
- Vista detallada de cada dataset con organización clara y profesional
- Visualización de videos asociados al dataset con reproductor integrado
- Enlace directo a la página oficial del dataset en Hugging Face
- Soporte completo para modo oscuro
- Interacciones suaves y responsivas

## Instalación

1. Clona el repositorio:
   ```bash
   git clone <url-del-repo>
   cd data-visualization
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```

## Uso

Inicia el servidor de desarrollo:
```bash
npm run dev
```

Abre tu navegador en [http://localhost:3000](http://localhost:3000)

## Estructura principal
- `app/` — Páginas y layout principal (Next.js)
- `components/` — Componentes reutilizables (cards, buscador, header, sección de video, etc.)

## Personalización y diseño
- El diseño ha sido modernizado con gradientes, iconos SVG, badges y efectos visuales suaves.
- La experiencia de usuario es limpia, profesional y responsiva.
- Puedes modificar fácilmente los componentes para agregar más detalles, visualizaciones o adaptar el estilo a tus necesidades.

---

Hecho con ❤️ usando Next.js, React y Tailwind CSS.