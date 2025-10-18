using Azure.Storage.Blobs;
using FinanceFunction.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Data
{
		public interface IBlobFileRepo
		{
				public Task<BlobFile?> GetOneFileinfo(Guid id);
				public Task<IEnumerable<BlobFile>> GetFiles();
				public Task DeleteRecord(BlobFile file);
		}
}
