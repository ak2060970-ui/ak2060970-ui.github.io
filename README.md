# Simple Floww website

Static website for simplefloww.com, plus a demo login and demo panel for showing the new design.

- `index.html` and the folders (`pricing/`, `partners/`, `about/`, `contact/`, legal pages): the public website
- `login/` and `signup/`: demo login and signup pages (nothing is saved or sent)
- `app/`: clickable demo of the new business panel (sample data)
- `assets/`: styles, script, logos and images

Hosting: Cloudflare Pages, connected to this repository. Every push to `main` deploys automatically.
No build step: build command empty, output directory `/`.
