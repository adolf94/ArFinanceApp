using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Models
{
		public class HookConfig
		{
				public string NameKey { get; set; } = "";

				public string Name { get; set; } = "";
				public string App { get; set; } = "";
				public string Regex { get; set; } = "";
				public string TitleRegex { get; set; } = "";
				public string Type { get; set; } = "";
				public string DisplayText { get; set; } = "";
				public long PriorityOrder { get; set; } = 0;
				public List<Condition> Conditions { get; set; } = new List<Condition>();
				public List<ExtractProperty> Properties { get; set; } = new List<ExtractProperty>();
				public List<SubHookConfig> SubConfigs { get; set; } = new List<SubHookConfig>();

				public bool Enabled { get; set; } = true;
				public bool Success { get; set; } = true;


				public class Condition
				{
						public string? HasLine { get; set; }
						public string? Property { get; set; }
						public string? Operation { get; set; }
						public string? Value { get; set; }
				}

				public class ExtractProperty
				{

						public int? RegexIndex  { get; set; }

						//Image
						public string? Property { get; set; }
						public string? LookFor { get; set; }
						public string? For { get; set; }
						public string? LookForRegex { get; set; }
						public int? GetValueAfter { get; set; }
						public List<ReplaceRegexConfig>? ReplaceRegex { get; set; } = new List<ReplaceRegexConfig>();
						public string? ExtractRegex { get; set; }
						public int? GetMatch { get; set; }
						public string[]? RemoveRegex { get; set; }

						public class ReplaceRegexConfig
						{
								public string F { get; set; } = "";
								public string T { get; set; } = "";
						}
				}
		
		
				public class SubHookConfig
				{
						public string SubConfig { get; set; } = "";
						public string DisplayName { get; set; } = "";
						public string Type { get; set; } = "";
						public string Vendor { get; set; } = "";
						public string Credit { get; set; } = "";
						public string Debit { get; set; } = "";
						public string Remarks { get; set; } = "";
						public string Comments { get; set; } = "";

				}
		}


}
