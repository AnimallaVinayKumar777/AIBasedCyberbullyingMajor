# SafeNet Run Guide

This guide walks you through running the SafeNet backend, frontend, JS SDK, and Chrome/Edge extension.

## 1) Install Dependencies

Open a terminal in the project root:

```powershell
cd c:\Users\S Althaf\Desktop\SafeNet
npm install
```

Open a second terminal for the backend:

```powershell
cd c:\Users\S Althaf\Desktop\SafeNet\backend
npm install
```

## 2) Start Backend (API)

From `c:\Users\S Althaf\Desktop\SafeNet\backend`:

```powershell
npm run dev
```

Backend URL:

```
http://localhost:5000
```

## 3) Start Frontend (React App)

From `c:\Users\S Althaf\Desktop\SafeNet`:

```powershell
npm run dev
```

Frontend URL:

```
http://localhost:8080
```

## 4) Build the Browser Extension (Chrome/Edge MV3)

From `c:\Users\S Althaf\Desktop\SafeNet`:

```powershell
npm run build:extension
```

Build output:

```
dist/extension
```

## 5) Load Extension in Chrome/Edge

1. Open `chrome://extensions` or `edge://extensions`
2. Enable Developer Mode
3. Click **Load unpacked**
4. Select:

```
c:\Users\S Althaf\Desktop\SafeNet\dist\extension
```

## 6) Build the JS SDK (Optional)

From `c:\Users\S Althaf\Desktop\SafeNet`:

```powershell
npm run build:sdk
```

Build output:

```
packages/safenet-sdk/dist
```

## 7) Test the AI Model (Optional)

From `c:\Users\S Althaf\Desktop\SafeNet`:

```powershell
npm run test:ai
```

## Troubleshooting

If the backend fails to start, confirm MongoDB is running and check:

```
backend/.env
```

If the extension shows missing icons, verify the following files exist:

```
icons/icon16.png
icons/icon32.png
icons/icon48.png
icons/icon128.png
```
