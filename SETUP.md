# D-CoE Platform — Setup Guide (Windows)

## Step 1 — Check Node.js version

Open PowerShell or Command Prompt and run:

```
node -v
```

You need **v18 or higher**. If you see an older version or "not recognized":

→ Download from: **https://nodejs.org** → click **"LTS"** → install it.

After installing, **close and reopen** PowerShell, then run `node -v` again.

---

## Step 2 — Install dependencies

In PowerShell, navigate to the project folder:

```
cd "C:\Users\akash\OneDrive\Desktop\Movies\dcoe-platform"
```

Then run:

```
npm install
```

If you get peer dependency errors, run this instead:

```
npm install --legacy-peer-deps
```

Wait for it to finish (may take 1–2 minutes on first run).

---

## Step 3 — Set up environment variables

In the project folder, create a new file called `.env.local`

Copy everything from `.env.example` into it and fill in your Firebase credentials.

**Minimum required to run locally (without Firebase):**

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=any-random-string-here

NEXT_PUBLIC_FIREBASE_API_KEY=placeholder
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=placeholder
NEXT_PUBLIC_FIREBASE_PROJECT_ID=placeholder
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=placeholder
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=placeholder
NEXT_PUBLIC_FIREBASE_APP_ID=placeholder

FIREBASE_ADMIN_PROJECT_ID=placeholder
FIREBASE_ADMIN_CLIENT_EMAIL=placeholder@placeholder.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nplaceholder\n-----END PRIVATE KEY-----\n"

TRAINER_EMAIL=trainer@dcoe-iisc.in
TRAINER_PASSWORD=dcoe@IISc2024
```

> For full functionality (student login, tests), you need real Firebase credentials.
> See **Firebase Setup** section in README.md.

---

## Step 4 — Run the app

```
npm run dev
```

Open your browser at: **http://localhost:3000**

---

## Troubleshooting

### "next is not recognized"
→ `npm install` did not complete. Run it again:
```
npm install --legacy-peer-deps
```

### "Cannot find module" errors
→ Delete node_modules and reinstall:
```
rmdir /s /q node_modules
del package-lock.json
npm install --legacy-peer-deps
```

### Port already in use
```
npm run dev -- --port 3001
```

### Firebase errors on startup
→ The app will show errors in the terminal but still load the landing page.
→ Auth/dashboard features require real Firebase credentials.

---

## Trainer Login

Once running, go to: **http://localhost:3000/auth/login**

Select **Trainer** tab and use:
- Email: `trainer@dcoe-iisc.in`
- Password: `dcoe@IISc2024`

(Change these in `.env.local` before deploying)
