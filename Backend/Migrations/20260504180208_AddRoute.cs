using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EvRoutePlanner.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRoute : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "Vehicles",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Nickname",
                table: "Vehicles",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "Range",
                table: "Vehicles",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "TopSpeed",
                table: "Vehicles",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<int>(
                name: "Year",
                table: "Vehicles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LastName",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "Routes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VehicleId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OriginLat = table.Column<double>(type: "float", nullable: false),
                    OriginLon = table.Column<double>(type: "float", nullable: false),
                    OriginName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OriginAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DestinationLat = table.Column<double>(type: "float", nullable: false),
                    DestinationLon = table.Column<double>(type: "float", nullable: false),
                    DestinationName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DestinationAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TotalDistance = table.Column<double>(type: "float", nullable: false),
                    TotalDuration = table.Column<double>(type: "float", nullable: false),
                    safeRange = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Routes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Routes_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Stop",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RouteId = table.Column<int>(type: "int", nullable: false),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    lat = table.Column<double>(type: "float", nullable: false),
                    lon = table.Column<double>(type: "float", nullable: false),
                    placeId = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stop", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Stop_Routes_RouteId",
                        column: x => x.RouteId,
                        principalTable: "Routes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Routes_VehicleId",
                table: "Routes",
                column: "VehicleId");

            migrationBuilder.CreateIndex(
                name: "IX_Stop_RouteId",
                table: "Stop",
                column: "RouteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Stop");

            migrationBuilder.DropTable(
                name: "Routes");

            migrationBuilder.DropColumn(
                name: "Color",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "Nickname",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "Range",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "TopSpeed",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "Year",
                table: "Vehicles");

            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LastName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "Users");
        }
    }
}
