using FinanceFunction.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Data
{
		public interface ITagRepo
		{
				public  Task<Tag> CreateTag(Tag item);
				public  Task<IEnumerable<Tag>> GetAllTags();
				public Task<IEnumerable<Tag>> UpdateTagCount(string[] previous, string[] after);

		}
}
