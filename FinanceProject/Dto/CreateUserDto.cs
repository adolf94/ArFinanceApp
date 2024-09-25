using FinanceProject.Models;

namespace FinanceApp.Dto
{
		public class CreateUserDto
		{
				public Guid Id { get; set; } = new Guid();

				public string? UserName { get; set; }

				public string MobileNumber { get; set; } = string.Empty;

				public string EmailAddress { get; set; } = string.Empty;

		}
}
