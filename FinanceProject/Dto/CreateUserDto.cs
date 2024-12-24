using FinanceProject.Models;

namespace FinanceApp.Dto
{
		public class CreateUserDto
		{
				public Guid Id { get; set; } = new Guid();

				public string? UserName { get; set; }
				public string Name { get; set; } = string.Empty;

				public string MobileNumber { get; set; } = string.Empty;

				public int? OtpCode { get; set; }
				public Guid? OtpGuid { get; set; }

		}
}
