# Twenty Crop

Split an image into evenly aligned vertical slices, entirely in your browser.

## Run locally

```sh
npm install
npm run dev
```

## Deploy to Vercel

1. Push this project to a Git provider supported by Vercel.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Keep the project root and the configured build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Choose **Deploy**. No environment variables are required.

The same settings are included in `vercel.json`. To deploy from a terminal instead,
run `npx vercel` for a preview deployment or `npx vercel --prod` for production.
