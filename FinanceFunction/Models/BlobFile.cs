using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Models
{
		public class BlobFile
		{
				public Guid Id { get; set; }
				public string Container { get; set; } = "";
				public string PartitionKey { get; set; } = "default";
				public string Service { get; set; } = "blob";
				public string OriginalFileName { get; set; } = "";
				public string MimeType { get; set; } = "";
				public string FileKey { get; set; } = "";
				public DateTime DateCreated { get; set; }	= DateTime.UtcNow;
				public string Status { get; set; } = "Active";

		}
}
