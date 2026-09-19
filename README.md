# Vende Todo en Hato Mayor 🇩🇴

Plataforma de clasificados y comercio local para **Hato Mayor del Rey, El Valle y Sabana de la Mar** (República Dominicana).

Dominio oficial: **https://vendetodoenhatomayor.live**

---

## 🚀 Cómo ejecutar el proyecto en tu computadora

Si descargaste el archivo ZIP o clonaste el repositorio desde GitHub:

### Requisitos
- [Node.js](https://nodejs.org/) v18 o superior instalado.
- npm (incluido con Node.js).

### Pasos de ejecución
1. Abre tu terminal en la carpeta del proyecto.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```
4. Abre tu navegador en:
   ```
   http://localhost:3000
   ```

El servidor iniciará tanto el backend (Node.js/Express) como la interfaz web interactiva (React 19 + Tailwind CSS + Firebase Firestore).

---

## 📦 Cómo subir y publicar en la web

### Opción A: Despliegue en Vercel (Gratis y con tu dominio)
1. Sube tu proyecto a un repositorio en **GitHub**.
2. Entra a [Vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
3. Haz clic en **Add New... > Project** e importa este repositorio.
4. En la configuración del proyecto:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Haz clic en **Deploy**.
6. Una vez desplegado, ve a **Settings > Domains** y añade tu dominio: `vendetodoenhatomayor.live`.
7. Vercel te dará un registro CNAME para configurar en tu registrador de dominios. ¡Listo!

### Opción B: Despliegue en Google Cloud Run / Render / Railway
Si deseas mantener el servidor Express activo en la nube:
- **Comando de compilación:** `npm run build`
- **Comando de inicio:** `npm start`
- El puerto por defecto es `3000`.

---

## ⚡ Características principales
- **Autonomía total**: Conexión en tiempo real con base de datos en la nube (Firebase Firestore).
- **Publicación protegida**: Solo usuarios registrados pueden publicar y gestionar artículos.
- **Roles claros**: Vendedores (publican y venden) y Compradores (exploran y guardan favoritos).
- **Control Central**: Panel administrativo exclusivo con moderación y control total.
- **Contacto Directo**: Botones de llamada y WhatsApp personalizados para compradores.
