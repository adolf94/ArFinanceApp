using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Models
{
		public class UserCredential
		{
				public string Id { get; set; }
				public string PartitionKey { get; set; } = "default";
		}
}
