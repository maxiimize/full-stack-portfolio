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
| Backend  | ASP.NET Core (.NET 10), C#, Entity Framework Core |
| Frontend | Angular 21, TypeScript, Tailwind CSS |
| Database | SQL Server (LocalDB)           |
| CI/CD    | GitHub Actions                 |

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- SQL Server LocalDB (included with Visual Studio, or install via [SQL Server Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads))

## Getting Started

### Backend

```bash
cd src/backend/Portfolio.Api
dotnet restore
dotnet ef database update   # create/migrate the database
dotnet run
```

The API will be available at `https://localhost:5001`.

### Frontend

```bash
cd src/frontend/portfolio
npm install
npm start
```

The app will be available at `http://localhost:4200`.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
