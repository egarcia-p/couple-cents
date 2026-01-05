<a id="readme-top"></a>

[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />

<div align="center">
  <a href="https://github.com/egarcia-p/couple-cents">
    <img src="public/logo.svg" alt="Logo" width="160" height="160">
  </a>

  <h3 align="center">CoupleCents App</h3>

  <p align="center">
    An awesome financial tool for Couples and Individuals!
    <br />
    <a href="https://couple-cents.vercel.app/">View Demo</a>
    ·
    <a href="https://github.com/egarcia-p/couple-cents/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/egarcia-p/couple-cents/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#tech-stack">Tech Stack</a></li>
      </ul>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#running-the-development-server">Running the Development Server</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>

  </ol>
</details>

# About The Project

Financial app tool for individuals and/or couples to track their expenses and income. This allows users to have an overview of their current finances and understand where their expenses and incomes are coming from. This is a web application available on all devices.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

This project uses the App router pattern.

### Tech Stack

- NextJS
- PostgreSQL
- DrizzleORM
- Auth.js
- TailwindCSS
- Chart.js

## Roadmap

- [x] CRUD of transactions(expenses and income)
- [x] Filtering of transactions by text or date
- [x] Dashboard with summary of current financial status
  - [x] Shows dashboard data by current month/year.
- [ ] Ability to setup a family.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

### Prerequisites

- npm

```sh
npm install npm@latest -g
```

### Installation

1. Install NPM packages

```sh
npm install
```

### Running the Development Server

Run Docker container with Posgtres Image 16

```bash
docker run -d --name couple-cents-db -p 5432:5432 -e POSTGRES_PASSWORD=<pass> postgres
```

Then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

### Database backup and migration using pg_dump

See: https://neon.com/docs/import/migrate-from-postgres

### Database Migrations

1. Edit the schema under `schema.ts`
2. run `npm run generate` if there is an error with migration not up to date run `npx drizzle-kit up`
3. then apply migrations by runnint `npx drizzle-kit migrate`
4. confirm changes in the database

For manual migrations:

1. Create an empty sql migration using `npx drizzle-kit generate --custom --name=<name of migration>`

### Testing

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- Versioning -->

This project follows the versioning using tags with [semantic-version](https://github.com/PaulHatch/semantic-version).

Use any of these tags in your final commit in the featre or bug branch to be merged:
`(PATCH)`
`(MINOR)`
`(MAJOR)`

<!-- LICENSE -->

## License

Distributed under the Apache License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Legal

- [Terms of Service](/terms) - Our terms and conditions
- [Privacy Notice](/privacy) - How we handle your data

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

Eugenio Garcia - [Linkedin](https://www.linkedin.com/in/ergarciag/)

Project Link: [https://github.com/egarcia-p/couple-cents](https://github.com/egarcia-p/couple-cents)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->

[issues-shield]: https://img.shields.io/github/issues/egarcia-p/couple-cents.svg?style=for-the-badge
[issues-url]: https://github.com/egarcia-p/couple-cents/issues
[license-shield]: https://img.shields.io/github/license/egarcia-p/couple-cents.svg?style=for-the-badge
[license-url]: https://github.com/egarcia-p/couple-cents/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/ergarciag/
