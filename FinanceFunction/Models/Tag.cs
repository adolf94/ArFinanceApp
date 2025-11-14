using Microsoft.Azure.Cosmos;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Models
{
		public class Tag
		{
				[Key]
				public string Value { get; set; } = "";
				public int Count { get; set; }
				public string PartitionKey { get; set; } = "default";
		}
}
