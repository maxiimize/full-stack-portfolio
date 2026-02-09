# Full-Stack Portfolio

A modern full-stack portfolio application built with **ASP.NET Core** (backend) and **Angular** (frontend).

## Project Structure

```
├── src/
│   ├── backend/       # ASP.NET Core Web API
│   └── frontend/      # Angular SPA
├── docs/              # Project documentation
├── .github/           # GitHub templates and workflows
├── CONTRIBUTING.md    # Contribution guidelines
└── README.md          # This file
```

## Tech Stack

| Layer    | Technology                     |
| -------- | ------------------------------ |
| Backend  | ASP.NET Core 8, C#, Entity Framework Core |
| Frontend | Angular 17+, TypeScript, SCSS  |
| Database | SQL Server / PostgreSQL        |
| CI/CD    | GitHub Actions                 |

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [Angular CLI](https://angular.dev/) (`npm install -g @angular/cli`)

## Getting Started

### Backend

```bash
cd src/backend
dotnet restore
dotnet run
```

The API will be available at `https://localhost:5001`.

### Frontend

```bash
cd src/frontend
npm install
ng serve
```

The app will be available at `http://localhost:4200`.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
