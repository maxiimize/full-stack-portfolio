# Full-Stack Portfolio

A modern full-stack portfolio application built with **ASP.NET Core** (backend) and **Angular** (frontend). It features JWT authentication, project management with screenshot uploads, tag-based filtering, and a health-check endpoint.

## Project Structure

```
├── src/
│   ├── backend/
│   │   ├── Portfolio.Api/       # ASP.NET Core Web API
│   │   └── Portfolio.Tests/     # xUnit integration & unit tests
│   └── frontend/
│       └── portfolio/           # Angular SPA
├── docs/                        # Project documentation
├── .github/                     # GitHub Actions CI & PR template
├── CONTRIBUTING.md              # Contribution guidelines
└── README.md                    # This file
```

## Tech Stack

| Layer    | Technology                                         |
| -------- | -------------------------------------------------- |
| Backend  | ASP.NET Core (.NET 10), C#, Entity Framework Core  |
| Frontend | Angular 21, TypeScript, Tailwind CSS 4             |
| Database | SQL Server (LocalDB for dev)                       |
| Auth     | JWT (Bearer tokens, BCrypt password hashing)        |
| Testing  | xUnit, FluentAssertions, WebApplicationFactory      |
| CI/CD    | GitHub Actions                                      |
| Docker   | Multi-stage Dockerfiles for API & frontend (nginx)  |

## Prerequisites

Install the following before you begin:

| Tool | Version | Notes |
| ---- | ------- | ----- |
| [.NET 10 SDK](https://dotnet.microsoft.com/download) | 10.0+ | Includes the runtime |
| [Node.js](https://nodejs.org/) | 20+ | npm is included |
| SQL Server LocalDB | — | Included with Visual Studio. Alternatively install [SQL Server Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) |
| [EF Core CLI](https://learn.microsoft.com/en-us/ef/core/cli/dotnet) | — | Install globally (see below) |

Install the EF Core CLI tool (required for database migrations):

```bash
dotnet tool install --global dotnet-ef
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/maxiimize/full-stack-portfolio.git
cd full-stack-portfolio
```

### 2. Backend (API)

```bash
cd src/backend/Portfolio.Api

# Restore NuGet packages
dotnet restore

# Create / migrate the database (SQL Server LocalDB)
dotnet ef database update

# Trust the .NET development HTTPS certificate (first time only)
dotnet dev-certs https --trust

# Start the API
dotnet run --launch-profile https
```

Once running you should see:

```
Now listening on: https://localhost:7175
Now listening on: http://localhost:5214
```

> **Tip:** If you only need HTTP, run `dotnet run` (without `--launch-profile https`). The API will listen on `http://localhost:5214`.

#### Verify the Backend

| URL | What it does |
| --- | ------------ |
| `https://localhost:7175/swagger` | Interactive API docs (Swagger UI) |
| `https://localhost:7175/health` | Health check – should return `{ "status": "Healthy" }` |
| `https://localhost:7175/weatherforecast` | Sample endpoint |

### 3. Frontend (Angular)

Open a **new terminal**:

```bash
cd src/frontend/portfolio

# Install npm dependencies
npm install

# Start the Angular dev server
npm start
```

The app will be available at **`http://localhost:4200`**.

> The frontend expects the API at `https://localhost:5001/api` by default (configured in `src/environments/environment.ts`). Update that file if your backend runs on a different port.

## API Endpoints

### Authentication (`/api/auth`)

| Method | Route | Auth | Description |
| ------ | ----- | ---- | ----------- |
| POST | `/api/auth/register` | — | Register a new user |
| POST | `/api/auth/login` | — | Log in and receive a JWT |

### Projects (`/api/projects`)

| Method | Route | Auth | Description |
| ------ | ----- | ---- | ----------- |
| GET | `/api/projects` | — | List projects (paged, optional `?tag=`) |
| GET | `/api/projects/{id}` | — | Get a single project |
| GET | `/api/projects/search` | — | Search projects |
| POST | `/api/projects` | Admin | Create a project |
| PUT | `/api/projects/{id}` | Admin | Update a project |
| DELETE | `/api/projects/{id}` | Admin | Delete a project |
| POST | `/api/projects/{id}/screenshots` | Admin | Upload a screenshot (multipart/form-data) |

### Other

| Method | Route | Description |
| ------ | ----- | ----------- |
| GET | `/health` | Database health check |
| GET | `/weatherforecast` | Sample data endpoint |

## Configuration

Application settings live in `src/backend/Portfolio.Api/appsettings.Development.json`:

```jsonc
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=PortfolioDB;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Jwt": {
    "Key": "SuperSecretDevKey_AtLeast32Characters!!",   // Change in production!
    "Issuer": "Portfolio.Api",
    "Audience": "Portfolio.Client",
    "ExpirationInMinutes": 60
  }
}
```

> **Important:** Never commit real secrets. Use [User Secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets) or environment variables for production.

## Running Tests

### Backend Tests

```bash
cd src/backend/Portfolio.Tests
dotnet test
```

The test project uses **xUnit**, **FluentAssertions**, and **WebApplicationFactory** with an **in-memory database**, so no SQL Server is required for tests.

### Frontend Tests

```bash
cd src/frontend/portfolio
npm test
```

Runs Karma / Jasmine tests in a browser. For headless CI mode:

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

## Docker

Both the API and frontend include multi-stage Dockerfiles.

### Build & Run the API

```bash
cd src/backend/Portfolio.Api
docker build -t portfolio-api .
docker run -p 8080:8080 portfolio-api
```

### Build & Run the Frontend

```bash
cd src/frontend/portfolio
docker build -t portfolio-frontend .
docker run -p 80:80 portfolio-frontend
```

## CI / CD

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and PR to `main`:

- **Backend job** — restores, builds, and tests the .NET project.
- **Frontend job** — installs, builds, and tests the Angular project.

## Troubleshooting

| Problem | Solution |
| ------- | -------- |
| `Failed to determine the https port for redirect` | Run with `dotnet run --launch-profile https`, or comment out `app.UseHttpsRedirection()` in `Program.cs` |
| Health endpoint returns `Unhealthy` | The database hasn't been created. Run `dotnet ef database update` in the `Portfolio.Api` folder |
| `dotnet ef` not found | Install the tool globally: `dotnet tool install --global dotnet-ef` |
| HTTPS certificate not trusted | Run `dotnet dev-certs https --trust` |
| Frontend can't reach the API | Check that the `apiUrl` in `src/environments/environment.ts` matches the backend's listening URL |

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
