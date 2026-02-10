using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Models;

namespace Portfolio.Api.Data;

public static class DbInitializer
{
    /// <summary>
    /// Seeds a default admin user when running in Development.
    /// Skips silently if the user already exists.
    /// </summary>
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var db = serviceProvider.GetRequiredService<AppDbContext>();

        const string adminEmail = "admin@portfolio.dev";

        if (await db.Users.AnyAsync(u => u.Email == adminEmail))
            return;

        var admin = new User
        {
            UserName = "admin",
            Email = adminEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            Role = "Admin"
        };

        db.Users.Add(admin);
        await db.SaveChangesAsync();

        Console.WriteLine($"[Seed] Default admin created — {adminEmail} / Admin123!");
    }
}
