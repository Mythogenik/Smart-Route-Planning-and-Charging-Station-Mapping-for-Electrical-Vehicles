using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EvRoutePlanner.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRoute : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Routes_Vehicles_VehicleId",
                table: "Routes");

            migrationBuilder.DropTable(
                name: "Stop");

            migrationBuilder.AddColumn<string>(
                name: "StopsJson",
                table: "Routes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Routes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Routes_UserId",
                table: "Routes",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Routes_Users_UserId",
                table: "Routes",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Routes_Vehicles_VehicleId",
                table: "Routes",
                column: "VehicleId",
                principalTable: "Vehicles",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Routes_Users_UserId",
                table: "Routes");

            migrationBuilder.DropForeignKey(
                name: "FK_Routes_Vehicles_VehicleId",
                table: "Routes");

            migrationBuilder.DropIndex(
                name: "IX_Routes_UserId",
                table: "Routes");

            migrationBuilder.DropColumn(
                name: "StopsJson",
                table: "Routes");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Routes");

            migrationBuilder.CreateTable(
                name: "Stop",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RouteId = table.Column<int>(type: "int", nullable: false),
                    address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    lat = table.Column<double>(type: "float", nullable: false),
                    lon = table.Column<double>(type: "float", nullable: false),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                name: "IX_Stop_RouteId",
                table: "Stop",
                column: "RouteId");

            migrationBuilder.AddForeignKey(
                name: "FK_Routes_Vehicles_VehicleId",
                table: "Routes",
                column: "VehicleId",
                principalTable: "Vehicles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
