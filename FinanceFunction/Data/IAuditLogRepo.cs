using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Data
{
		public interface IAuditLogRepo
		{
				public Task<Guid> AddFromRequest(HttpRequest req);
				public Task<bool> UpdateStatus(int status, Stream body);
				public Task<bool> UpdateStatus(int status, object body);
				public Task<Guid> AddLogging(object requestBody, string path, string ip);


		}
}
