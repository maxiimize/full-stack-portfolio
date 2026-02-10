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

public class ScreenshotUploadTests : IClassFixture<CustomWebApplicationFactory>
{
    private const string Password = "P@ssw0rd!";

    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public ScreenshotUploadTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    private async Task<string> GetAdminTokenAsync()
    {
        var email = $"admin-{Guid.NewGuid():N}@example.com";
        var userName = $"a{Guid.NewGuid():N}"[..20];

        var registerRequest = new RegisterRequest
        {
            UserName = userName,
            Email = email,
            Password = Password
        };
        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);
        registerResponse.EnsureSuccessStatusCode();

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var user = db.Users.Single(u => u.Email == email);
        user.Role = "Admin";
        await db.SaveChangesAsync();

        var loginRequest = new LoginRequest { Email = email, Password = Password };
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        loginResponse.EnsureSuccessStatusCode();

        var auth = await loginResponse.Content.ReadFromJsonAsync<AuthResponse>();
        return auth!.Token;
    }

    private async Task<int> CreateProjectAsync(string token)
    {
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var request = new CreateProjectRequest(
            Title: "Upload Test Project",
            Description: "Project for screenshot upload tests",
            LiveUrl: "https://example.com",
            SourceUrl: "https://github.com/example/repo",
            Tags: ["C#"],
            Screenshots: []
        );

        var response = await _client.PostAsJsonAsync("/api/projects", request);
        response.EnsureSuccessStatusCode();

        var project = await response.Content.ReadFromJsonAsync<ProjectResponse>();
        return project!.Id;
    }

    private static MultipartFormDataContent BuildFakeImageContent(
        string fileName = "test-image.png",
        string? altText = "Main screenshot",
        int sortOrder = 1)
    {
        // 1×1 white PNG (67 bytes)
        byte[] pngBytes =
        [
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
            0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC,
            0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
            0x44, 0xAE, 0x42, 0x60, 0x82
        ];

        var fileContent = new ByteArrayContent(pngBytes);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/png");

        var form = new MultipartFormDataContent
        {
            { fileContent, "file", fileName }
        };

        if (altText is not null)
            form.Add(new StringContent(altText), "altText");

        form.Add(new StringContent(sortOrder.ToString()), "sortOrder");

        return form;
    }

    [Fact]
    public async Task UploadScreenshot_ValidFile_Returns200()
    {
        // Arrange
        var token = await GetAdminTokenAsync();
        var projectId = await CreateProjectAsync(token);

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        using var content = BuildFakeImageContent();

        // Act
        var response = await _client.PostAsync($"/api/projects/{projectId}/screenshots", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var screenshot = await response.Content.ReadFromJsonAsync<ScreenshotDto>();
        screenshot.Should().NotBeNull();
        screenshot!.Url.Should().Contain($"/uploads/{projectId}/");
        screenshot.AltText.Should().Be("Main screenshot");
        screenshot.SortOrder.Should().Be(1);
    }

    [Fact]
    public async Task UploadScreenshot_EntitySavedInDatabase()
    {
        // Arrange
        var token = await GetAdminTokenAsync();
        var projectId = await CreateProjectAsync(token);

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        using var content = BuildFakeImageContent(altText: "DB check", sortOrder: 2);

        // Act
        var response = await _client.PostAsync($"/api/projects/{projectId}/screenshots", content);
        response.EnsureSuccessStatusCode();

        // Assert — verify Screenshot entity exists in the database
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var saved = db.Screenshots.Where(s => s.ProjectId == projectId).ToList();
        saved.Should().ContainSingle();
        saved[0].AltText.Should().Be("DB check");
        saved[0].SortOrder.Should().Be(2);
        saved[0].Url.Should().StartWith($"/uploads/{projectId}/");
    }

    [Fact]
    public async Task UploadScreenshot_FileSavedInLocalTestFolder()
    {
        // Arrange
        var token = await GetAdminTokenAsync();
        var projectId = await CreateProjectAsync(token);

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        using var content = BuildFakeImageContent();

        // Act
        var response = await _client.PostAsync($"/api/projects/{projectId}/screenshots", content);
        response.EnsureSuccessStatusCode();

        // Assert — verify the file was written to disk
        var projectUploadDir = Path.Combine(_factory.UploadsPath, projectId.ToString());
        Directory.Exists(projectUploadDir).Should().BeTrue("upload directory should be created");

        var files = Directory.GetFiles(projectUploadDir);
        files.Should().ContainSingle("exactly one file should be saved");
        files[0].Should().EndWith(".png");

        var bytes = await File.ReadAllBytesAsync(files[0]);
        bytes.Length.Should().BeGreaterThan(0, "the saved file should not be empty");
    }
}
