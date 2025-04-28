
# Frontend Project

## Overview

This is a **Next.js** frontend project styled with **Tailwind CSS** and using **Google Fonts (Geist and Geist Mono)**.  
The layout is fully responsive with a Header, Footer, and a Main Body section. 
---

## Technologies Used

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Google Fonts: Geist & Geist Mono](https://fonts.google.com/)
- Responsive design principles.

---

## Folder Structure

```plaintext
/components
  ├── CallInterface.tsx
  ├── Header.tsx
  ├── Footer.tsx
/app
  ├── page.tsx
  ├── layout.tsx (RootLayout)
  ├── globals.css
public
  ├── images/logos
```

---

## Setup Instructions

1. **Clone the repository:**

```bash
git clone https://github.com/MaazSId44/Saastellar-frontend.git
```

2. **Install dependencies:**

```bash
npm install
# or
yarn install
```

3. **Run the development server:**

```bash
npm run dev
# or
yarn dev
```

4. **Visit:**

Open [http://localhost:3000](http://localhost:3000) to see your application.

---

## Layout Behavior

- `Header` at the top
- `Main` body (`children`)
- `Footer` at the bottom
- No scroll on larger screens (`lg:` and above), but normal scroll on small devices.

---

## Fonts Setup

Fonts are imported using Next.js `next/font/google` system for better performance.

```tsx
import { Geist, Geist_Mono } from "next/font/google";
```

---

## License

This project is licensed for personal and commercial use.

---

✅ **Everything ready.**
