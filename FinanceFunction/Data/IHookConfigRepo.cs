using FinanceFunction.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Data
{
		public interface IHookConfigRepo
		{
				public Task<IEnumerable<HookConfig>> GetConfigByType(string type);
				public Task<HookConfig> Create(HookConfig item);
				public Task<HookConfig?> GetOneByName(string name, string type);

		}
}
