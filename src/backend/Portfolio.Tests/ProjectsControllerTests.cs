using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Portfolio.Api.Data;
using Portfolio.Api.DTOs;
using Portfolio.Api.Models;
using Portfolio.Tests.Fixtures;

namespace Portfolio.Tests;

public class ProjectsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private const string Password = "P@ssw0rd!";

    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public ProjectsControllerTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    private async Task<string> GetAdminTokenAsync()
    {
        var email = $"admin-{Guid.NewGuid():N}@example.com";
        var userName = $"a{Guid.NewGuid():N}"[..20];

        // Register user
        var registerRequest = new RegisterRequest
        {
            UserName = userName,
            Email = email,
            Password = Password
        };
        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);
        registerResponse.EnsureSuccessStatusCode();

        // Promote to Admin directly in the database
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var user = db.Users.Single(u => u.Email == email);
        user.Role = "Admin";
        await db.SaveChangesAsync();

        // Login to obtain JWT with Admin role
        var loginRequest = new LoginRequest { Email = email, Password = Password };
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        loginResponse.EnsureSuccessStatusCode();

        var auth = await loginResponse.Content.ReadFromJsonAsync<AuthResponse>();
        return auth!.Token;
    }

    private static CreateProjectRequest BuildCreateRequest() => new(
        Title: "Test Project",
        Description: "Integration test project",
        LiveUrl: "https://example.com",
        SourceUrl: "https://github.com/example/repo",
        Tags: ["C#", "ASP.NET"],
        Screenshots:
        [
            new ScreenshotDto(0, "https://example.com/screenshot.png", "Main view", 1)
        ]
    );

    [Fact]
    public async Task Create_AsAdmin_Returns201WithProject()
    {
        // Arrange
        var token = await GetAdminTokenAsync();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var request = BuildCreateRequest();

        // Act
        var response = await _client.PostAsJsonAsync("/api/projects", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        response.Headers.Location.Should().NotBeNull();

        var project = await response.Content.ReadFromJsonAsync<ProjectResponse>();
        project.Should().NotBeNull();
        project!.Id.Should().BeGreaterThan(0);
        project.Title.Should().Be(request.Title);
        project.Description.Should().Be(request.Description);
        project.LiveUrl.Should().Be(request.LiveUrl);
        project.SourceUrl.Should().Be(request.SourceUrl);
        project.Tags.Should().BeEquivalentTo(request.Tags);
        project.Screenshots.Should().HaveCount(1);
    }

    [Fact]
    public async Task Create_WithoutAuth_Returns401()
    {
        // Arrange — no Authorization header
        var client = _factory.CreateClient();
        var request = BuildCreateRequest();

        // Act
        var response = await client.PostAsJsonAsync("/api/projects", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Create_AsAdmin_ProjectIsPersistedInDatabase()
    {
        // Arrange
        var token = await GetAdminTokenAsync();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var request = BuildCreateRequest();

        // Act
        var response = await _client.PostAsJsonAsync("/api/projects", request);
        response.EnsureSuccessStatusCode();

        var created = await response.Content.ReadFromJsonAsync<ProjectResponse>();

        // Assert — verify directly against the database
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var persisted = db.Projects
            .Where(p => p.Id == created!.Id)
            .Select(p => new
            {
                p.Title,
                p.Description,
                Tags = p.Tags.Select(t => t.Name).ToList(),
                ScreenshotCount = p.Screenshots.Count
            })
            .Single();

        persisted.Title.Should().Be(request.Title);
        persisted.Description.Should().Be(request.Description);
        persisted.Tags.Should().BeEquivalentTo(request.Tags);
        persisted.ScreenshotCount.Should().Be(request.Screenshots.Count);
    }
}
