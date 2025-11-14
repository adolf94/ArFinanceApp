using FinanceFunction.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Data.CosmosRepo
{
		public class TagRepo : ITagRepo
		{
				private readonly AppDbContext _context;
				public TagRepo(AppDbContext context)
				{
						_context = context;
				}

				public async Task<Tag> CreateTag(Tag item)
				{
						var data = await _context.Tags.Where(e => e.Value == item.Value).FirstOrDefaultAsync();
						if (data != null) return data;

						await _context.Tags.AddAsync(item);
						return item;
				}

				public async Task<IEnumerable<Tag>> GetAllTags()
				{
						return await _context.Tags.ToListAsync();
				}

				public async Task<IEnumerable<Tag>> UpdateTagCount(string[] previous, string[] after)
				{
						var newTags = after.Where(a => !previous.Contains(a)).ToList();

						var newTagItems = await _context.Tags.Where(e => newTags.Contains(e.Value)).ToListAsync();

						newTagItems.ForEach(e => e.Count++);
						return newTagItems;
				}
		}
}
