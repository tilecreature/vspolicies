# Vasser Studios privacy policies

Public privacy policies for Vasser Studios apps. Currently includes **Calorie to Kilojoules** only.

Contact: **vasserstudios@hotmail.com**

Published site: https://tilecreature.github.io/vspolicies/

Calorie to Kilojoules policy: https://tilecreature.github.io/vspolicies/calorie-to-kilojoules/

## Editing and previewing

Requires Node.js 22 or newer. No dependencies or installation step is needed.

1. Edit the policy in `content/calorie-to-kilojoules.html`.
2. Update the contact email and revision date in `site.config.json` when appropriate.
3. Run `npm run build` to regenerate `docs/`.
4. Run `npm run preview` and open http://127.0.0.1:4173/vspolicies/.
5. Commit source changes and the regenerated `docs/` pages together. Push to `main` to publish.

The build rejects a missing or invalid contact address. Generated HTML has no runtime dependencies, external fonts, analytics, advertising or tracking scripts. Pages work without JavaScript.

## Hosting

GitHub Pages serves the committed `docs/` directory from the `main` branch. In the repository’s Settings → Pages, use **Deploy from a branch**, select **main**, and choose **/docs**. The repository must be public for free GitHub Pages hosting.

GitHub processes website visitor information as described in its privacy statement; the app policy discloses this separately from app data handling.

## Adding another app

Add an entry to the `apps` array in `site.config.json` with a unique lowercase hyphenated slug, name, description and Android package. Create `content/<slug>.html` describing that app’s actual information practices. Use `{{contactLink}}` where the contact email link should appear. Rebuild and verify the resulting pages before publishing.

When removing an app, also remove its generated `docs/<slug>/` directory before publishing; the build does not delete existing files.

Do not copy one app’s claims to another without checking its permissions, SDKs, network requests and storage behavior. Keep signing keys, passwords and app source code out of this repository.
