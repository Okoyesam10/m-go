# M.Go: your own hosted copy

Everything here is a static website. Firebase (free) handles live game sync and signs each phone in anonymously, so nobody needs an account.

## 1. Set up Firebase (about 10 minutes, free Spark plan)

1. Go to https://console.firebase.google.com and click **Add project**. Name it (e.g. `m-go`). Google Analytics is optional.
2. **Build > Authentication > Get started > Sign-in method**: enable **Anonymous**.
3. **Build > Firestore Database > Create database**: choose a location near you (e.g. `europe-west2`, London), start in **production mode**.
4. In Firestore, open the **Rules** tab, replace everything with the contents of `firestore.rules`, and click **Publish**.
5. **Project settings (gear icon) > Your apps > Web (`</>`)**: register an app (no hosting needed at this step). Copy the `firebaseConfig` values into `firebase-config.js`.

## 2. Put it online (pick one)

**Option A: Netlify Drop (easiest, no tools)**
Go to https://app.netlify.com/drop and drag this whole folder onto the page. You get a link like `https://something.netlify.app`. Sign up free to keep it and rename it.

**Option B: Firebase Hosting (same place as your data)**
```
npm install -g firebase-tools
firebase login
cd mgo-site
firebase use --add        # pick your project
firebase deploy           # deploys the site and the Firestore rules
```
You get `https://<project-id>.web.app`.

## 3. Play

- Open the link on your phone, tap **Start a new table**, then **Invite friends** to share the table link.
- On iPhone: Share > **Add to Home Screen**. On Android: menu > **Install app**. It then opens full screen like an app.

## Updating the game later

Edit `index.html` and redeploy (drag the folder to Netlify again, or `firebase deploy`). Games in progress are kept.

## If something's wrong

- "Almost there: add your Firebase settings": `firebase-config.js` still has the `PASTE_` placeholders.
- Moves don't save: check the Firestore rules were published and Anonymous sign-in is enabled.
- Hosting on your own domain: add it under Authentication > Settings > **Authorized domains**.
