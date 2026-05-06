# bioanalytics-pro-documento

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_9yxVvqM0O8zMChRgX7pnbe3ToILp)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Qualidade (estado atual)

Scripts disponíveis no `package.json`:

```bash
npm run lint  # roda lint de testes JS + typecheck TS/TSX
npm run typecheck
npm run build
```

Scripts adicionais disponíveis no projeto:

- `npm run lint:tests` (somente ESLint dos testes JS)
- `npm run test` (smoke test inicial com `node:test`)

> Observação: o build atual não depende mais de download de fontes Google.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/kleberrangel1983/bioanalytics-pro-documento" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>


## Observação de ambiente

`npm run lint` agora encadeia `lint:tests` + `typecheck`, mantendo validação de testes JS e adicionando guarda para TS/TSX sem depender de novos pacotes de lint.
