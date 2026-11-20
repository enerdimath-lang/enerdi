# ENERDI website

Next.js (App Router) website for ENERDI, written in TypeScript with Tailwind CSS.

## Run it

You need Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

For a production build:

```bash
npm run build
npm start
```

## Where things are

| What | Where |
| --- | --- |
| All website text | `src/content/site.ts` |
| Pages | `src/app/<page>/page.tsx` |
| Header, footer, logo, cards, contact form | `src/components/` |
| Brand colours and fonts | `src/app/globals.css` |

## Contact form

Each enquiry is emailed to the address in `CONTACT_TO` (currently
`mettadivya528@gmail.com`). The website sends it through Gmail, so it needs a Gmail
account to send from:

1. Switch on 2-Step Verification for that Gmail account.
2. Create an app password at https://myaccount.google.com/apppasswords.
3. Copy `.env.example` to `.env.local`.
4. In `.env.local`, set `SMTP_USER` to the Gmail address and `SMTP_PASSWORD` to the app password.
5. Restart `npm run dev`.

To change who receives enquiries, edit `CONTACT_TO` in `.env.local`. When you host the
site (for example on Vercel), add the same settings as environment variables there.

Until this is done, the form shows "The contact form is not set up yet."

## Still to do

- **Product descriptions.** Only the product names were supplied, so each card says
  "Product details coming soon." Replace the `text` of each product in `src/content/site.ts`.
- **Contact form email.** See "Contact form" below: it needs a Gmail app password before it
  can send.
- **Knowledge Hub.** The topics are placeholders marked "Articles coming soon".
