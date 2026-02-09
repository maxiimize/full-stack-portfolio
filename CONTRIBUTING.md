# Contributing

Thanks for your interest in contributing! Here's how you can help.

## Getting Started

1. **Fork** the repository.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/full-stack-portfolio.git
   ```
3. Create a **feature branch**:
   ```bash
   git checkout -b feature/my-feature
   ```
4. Make your changes and **commit** with a clear message:
   ```bash
   git commit -m "feat: add new portfolio section"
   ```
5. **Push** to your fork and open a **Pull Request**.

## Branch Naming

| Prefix      | Purpose               |
| ----------- | --------------------- |
| `feature/`  | New features          |
| `fix/`      | Bug fixes             |
| `docs/`     | Documentation changes |
| `refactor/` | Code refactoring      |
| `test/`     | Adding/updating tests |

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>
```

Examples:
- `feat(api): add project endpoints`
- `fix(ui): correct navigation alignment`
- `docs: update setup instructions`

## Code Style

- **C# / Backend** — Follow the default .NET coding conventions. Use `dotnet format` before committing.
- **TypeScript / Frontend** — Follow the Angular style guide. Run `ng lint` before committing.

## Pull Requests

- Fill out the pull request template completely.
- Keep PRs focused — one feature or fix per PR.
- Ensure all existing tests pass (`dotnet test` / `ng test`).
- Add tests for new functionality when applicable.

## Reporting Issues

Open a GitHub Issue with:
- A clear title and description.
- Steps to reproduce (if it's a bug).
- Expected vs. actual behavior.
- Screenshots or logs if relevant.

## Code of Conduct

Be respectful and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct.
