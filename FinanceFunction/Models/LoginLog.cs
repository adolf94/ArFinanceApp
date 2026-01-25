using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Models
{
		public class LoginLog
		{
				public string Id { get; set; } = UUIDNext.Uuid.NewSequential().ToString();
				public string JwtId { get; set; } = "";
				public string RefreshToken { get; set; } = "";
				public string EmailAddress { get; set; } = "";
				public bool IsAuthenticated { get; set; } = false;

				public DateTime Expiry { get; set; } = DateTime.UtcNow;
				public DateTime MovingExpiry { get; set; } = DateTime.UtcNow;

				public Guid UserId { get; set; }

				public bool IsExpired { get; set; }
				public string PartitionKey { get; set; } = "default";


		}
}
