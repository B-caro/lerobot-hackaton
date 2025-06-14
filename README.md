# Visualizador de Datasets de Hugging Face (LeRobot)

Este proyecto es una aplicación web para explorar y visualizar datasets públicos del usuario **lerobot** en Hugging Face. Permite buscar, filtrar y navegar entre los datasets, así como ver detalles básicos de cada uno.

## Características
- Listado de todos los datasets públicos de `lerobot` en Hugging Face
- Buscador predictivo/autocompletado por nombre de dataset
- Visualización de detalles básicos: nombre, descripción, likes, descargas, tags, etc.
- Enlace directo a la página oficial del dataset en Hugging Face
- Preparado para mostrar esquema, tabla y visualizaciones (puedes expandirlo fácilmente)

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
- `components/` — Componentes reutilizables (cards, buscador, header, etc.)

## Personalización
Puedes modificar fácilmente el código para mostrar más detalles, agregar visualizaciones, o adaptar el filtrado a tus necesidades.

---

Hecho con ❤️ usando Next.js, React y Tailwind CSS. 