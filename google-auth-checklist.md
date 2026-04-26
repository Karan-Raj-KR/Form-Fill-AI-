# FormFill AI: Google Auth Setup Checklist

Follow these exact steps to activate the "Sign in with Google" functionality in your extension:

## 1. Create a Google Cloud Project
- [ ] Go to the [Google Cloud Console](https://console.cloud.google.com).
- [ ] Click the dropdown at the top left and select **New Project**.
- [ ] Name it "FormFill AI" and create it. Wait for it to provision.

## 2. Configure the OAuth Consent Screen
- [ ] In the sidebar, navigate to **APIs & Services** > **OAuth consent screen**.
- [ ] Select **External** (or Internal if you have a Google Workspace) and click **Create**.
- [ ] Fill in the App information (App Name: FormFill AI, User support email).
- [ ] For Developer contact information, add your email. 
- [ ] Click **Save and Continue**.
- [ ] Click **Add or Remove Scopes**. Add `.../auth/userinfo.email` and `.../auth/userinfo.profile`. Avoid sensitive scopes. Save and Continue.
- [ ] Add your Google account email as a **Test User** (you must do this or it won't let you sign in!). Save and Continue.

## 3. Get Your Extension ID
- [ ] You must have your extension installed locally first!
- [ ] In Chrome, go to `chrome://extensions/`.
- [ ] Turn on **Developer mode** (top right).
- [ ] Load your `dist` unpacked folder.
- [ ] Copy the generated 32-character **Extension ID** (e.g., `abcdefghijklmnopqrstuvwxyzabcdef`).

## 4. Create the OAuth Client ID
- [ ] Back in Google Cloud Console, navigate to **APIs & Services** > **Credentials**.
- [ ] Click **+ Create Credentials** at the top and select **OAuth client ID**.
- [ ] Under Application type, crucially select **Chrome app**.
- [ ] Enter a Name (e.g., "Extension Client").
- [ ] Paste your 32-character **Extension ID** into the Application ID field.
- [ ] Click **Create**.
- [ ] You will be shown your Client ID (it ends with `.apps.googleusercontent.com`). **Copy it**.

## 5. Add to Manifest
- [ ] Open your `public/manifest.json` file.
- [ ] Replace `YOUR_GOOGLE_OAUTH_CLIENT_ID_HERE.apps.googleusercontent.com` with the copied Client ID.
- [ ] Run `npm run build` again.
- [ ] Go back to `chrome://extensions` and click the "Refresh" icon on your extension to reload the new manifest.

## 6. Test the Flow!
- [ ] Open the Extension or the full Landing Page.
- [ ] Click **Sign in with Google**.
- [ ] A Google popup should appear, allow permissions, and you're officially authenticated!
