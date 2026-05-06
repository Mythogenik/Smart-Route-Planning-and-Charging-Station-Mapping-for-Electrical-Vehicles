using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EvRoutePlanner.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRoutesRemaining : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RoutesRemaining",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RoutesRemaining",
                table: "Users");
        }
    }
}
