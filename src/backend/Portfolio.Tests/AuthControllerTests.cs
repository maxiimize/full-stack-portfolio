using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Portfolio.Api.DTOs;
using Portfolio.Tests.Fixtures;

namespace Portfolio.Tests;

public class AuthControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private const string TestPassword = "P@ssw0rd!";

    private readonly HttpClient _client;

    public AuthControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<string> RegisterTestUserAsync()
    {
        var email = $"user-{Guid.NewGuid():N}@example.com";
        var request = new RegisterRequest
        {
            UserName = $"u{Guid.NewGuid():N}"[..20],
            Email = email,
            Password = TestPassword
        };

        var response = await _client.PostAsJsonAsync("/api/auth/register", request);
        response.EnsureSuccessStatusCode();

        return email;
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsOkWithToken()
    {
        // Arrange
        var email = await RegisterTestUserAsync();
        var request = new LoginRequest { Email = email, Password = TestPassword };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<AuthResponse>();
        body.Should().NotBeNull();
        body!.Token.Should().NotBeNullOrWhiteSpace();
        body.Expiration.Should().BeAfter(DateTime.UtcNow);
        body.Role.Should().Be("User");
    }

    [Fact]
    public async Task Login_InvalidPassword_ReturnsUnauthorized()
    {
        // Arrange
        var email = await RegisterTestUserAsync();
        var request = new LoginRequest { Email = email, Password = "WrongPassword!" };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
