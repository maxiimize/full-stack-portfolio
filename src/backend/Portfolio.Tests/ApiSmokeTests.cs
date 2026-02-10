using System.Net;
using FluentAssertions;
using Portfolio.Tests.Fixtures;

namespace Portfolio.Tests;

public class ApiSmokeTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ApiSmokeTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task HealthCheck_ReturnsSuccessStatusCode()
    {
        // Arrange & Act
        var response = await _client.GetAsync("/weatherforecast");

        // Assert
        response.StatusCode.Should().NotBe(HttpStatusCode.InternalServerError);
    }
}
