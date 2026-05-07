using EvRoutePlanner.Api;
using EvRoutePlanner.Api.Interfaces;
using EvRoutePlanner.Api.Services;
using EvRoutePlanner.Api.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- FIX 1: UPDATE CORS POLICY ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173", 
                "http://localhost:5174",
                "https://smart-route-planning-and-charging-2ann.onrender.com" // Add your live Render URL here
              )
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// --- FIX 2: SWITCH FROM SQL SERVER TO POSTGRES ---
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"), npgsqlOptionsAction: npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToRetry: null);
    }));

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = 
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddEndpointsApiExplorer();

var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>() ?? new JwtSettings();
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
        RoleClaimType = ClaimTypes.Role
    };
});

builder.Services.AddAuthorization();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "EV Smart Route Planner API",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer <token>'"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});

builder.Services.AddHttpClient("Nominatim", client =>
{
    client.BaseAddress = new Uri("https://nominatim.openstreetmap.org/");
    client.DefaultRequestHeaders.Add("User-Agent", "EV-Route-Planner/1.0");
});

builder.Services.AddHttpClient<IOpenChargeMapService, OpenChargeMapService>(client =>
{
    client.BaseAddress = new Uri("https://api.openchargemap.io/");
    client.DefaultRequestHeaders.Add("User-Agent", "EV-Route-Planner/1.0");
});

builder.Services.AddHttpClient<ICarQueryApiService, CarQueryApiService>(client =>
{
    client.BaseAddress = new Uri("https://api.carqueryapi.com/");
    client.DefaultRequestHeaders.Add("User-Agent", "EV-Route-Planner/1.0");
});

builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddScoped<IEvModelService, EvModelService>();
builder.Services.AddScoped<IChargingStationService, ChargingStationService>();
builder.Services.AddScoped<ILocationService, LocationService>();
builder.Services.AddScoped<IRangeService, RangeService>();
builder.Services.AddHttpClient<IFuelEconomyService, FuelEconomyService>();
builder.Services.AddScoped<IRouteOptimizationService, RouteOptimizationService>();
builder.Services.AddScoped<IRouteService, RouteService>();

var app = builder.Build();

// Enable Swagger in Production for testing if you want, 
// but usually it's kept in Development. 
// If you want to see the Swagger page on Render, remove the IsDevelopment() check.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseRouting();

// CORS MUST be after UseRouting and before UseAuthentication/Authorization
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();