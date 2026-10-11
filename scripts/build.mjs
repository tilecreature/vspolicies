import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const config = JSON.parse(await readFile(path.join(root, 'site.config.json'), 'utf8'));
const email = config.contactEmail?.trim();
if (!email || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) {
  throw new Error('Set a valid public contactEmail in site.config.json before publishing.');
}
if (!/^\/[a-z0-9-]+$/.test(config.basePath)) throw new Error('Invalid basePath.');
if (!/^\d{4}-\d{2}-\d{2}$/.test(config.updated)) throw new Error('Invalid updated date.');
const escape = (text) => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const base = config.basePath;
const developer = escape(config.developer);
const contactLink = `<a href="mailto:${escape(email)}">${escape(email)}</a>`;
const date = new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${config.updated}T00:00:00Z`));
const layout = (title, content, description) => `<!doctype html>
<html lang="en-AU">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escape(description)}">
  <meta name="theme-color" content="#0b0b0b">
  <title>${escape(title)} | ${developer}</title>
  <link rel="stylesheet" href="${base}/assets/site.css">
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <header class="site-header"><div class="header-inner"><a class="brand" href="${base}/">Vasser <span>Studios</span></a><span class="header-label">Privacy policies</span></div></header>
  <main id="main">${content}</main>
  <footer class="site-footer"><p>${developer}</p><p>Privacy enquiries: ${contactLink}</p></footer>
</body>
</html>
`;

// Read and validate all source material before writing publishable pages.
const slugs = new Set();
const pages = [];
for (const app of config.apps) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(app.slug) || slugs.has(app.slug)) throw new Error('Invalid or duplicate app slug.');
  slugs.add(app.slug);
  const source = await readFile(path.join(root, 'content', `${app.slug}.html`), 'utf8');
  const policy = source.replaceAll('{{contactLink}}', contactLink);
  if (/\{\{.*?\}\}/.test(policy)) throw new Error(`Unresolved placeholder in ${app.slug}.`);
  const content = `<a class="back-link" href="${base}/">← All privacy policies</a>
    <p class="eyebrow">Privacy policy</p><h1>${escape(app.name)}</h1><p class="intro">${escape(app.description)}</p>
    <div class="policy-layout"><article class="policy" aria-label="Privacy policy">${policy}</article>
    <aside class="details" aria-label="Policy details"><p><strong>Developer</strong>${developer}</p><p><strong>Updated</strong><time datetime="${config.updated}">${date}</time></p><p><strong>Android package</strong>${escape(app.packageName)}</p></aside></div>`;
  pages.push([`${app.slug}/index.html`, layout(`${app.name} — Privacy policy`, content, `Privacy policy for ${app.name}, developed by ${config.developer}.`)]);
}
if (!pages.length) throw new Error('At least one app policy is required.');
const cards = config.apps.map(app => `<a class="app-card" href="${base}/${app.slug}/"><h2>${escape(app.name)}</h2><p>${escape(app.description)}</p><span class="card-action">Read privacy policy →</span></a>`).join('\n');
pages.push(['index.html', layout('Privacy policies', `<p class="eyebrow">Vasser Studios</p><h1>Privacy policies</h1><p class="intro">How our apps handle your information.</p>${cards}`, 'Privacy policies for apps developed by Vasser Studios.')]);
pages.push(['404.html', layout('Page not found', `<p class="eyebrow">Vasser Studios</p><h1>Page not found</h1><p class="intro">Find the privacy policy for your app on our <a href="${base}/">policies page</a>.</p>`, 'Find a Vasser Studios privacy policy.')]);
pages.push(['assets/site.css', await readFile(path.join(root, 'assets/site.css'), 'utf8')]);
pages.push(['.nojekyll', '']);
for (const [relative, content] of pages) {
  const target = path.join(root, 'docs', relative);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content);
}
console.log(`Built ${config.apps.length} policy page(s) in docs/. Contact: ${email}`);
