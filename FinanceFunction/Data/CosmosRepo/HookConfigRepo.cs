using FinanceFunction.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Data.CosmosRepo
{
		public class HookConfigRepo : IHookConfigRepo
		{
				private readonly AppDbContext _context;

				public HookConfigRepo(AppDbContext context)
				{
						_context = context;
				}


				public async Task<IEnumerable<HookConfig>> GetConfigByType(string type)
				{
						var item = await _context.HookConfigs.Where(e => e.Type == type)
								.ToArrayAsync();

						return item;
				}
				
				public async Task<HookConfig> Create(HookConfig item)
				{
						await _context.HookConfigs.AddAsync(item);
						return item;
				}

				public async Task<HookConfig?> GetOneByName(string name)
				{
						var item = await _context.HookConfigs.FindAsync(name);
						return item;
				}
		}
}
