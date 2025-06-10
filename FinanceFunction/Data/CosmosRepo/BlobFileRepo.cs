using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using FinanceFunction.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceFunction.Data.CosmosRepo
{
		public class BlobFileRepo : IBlobFileRepo
		{
				private readonly AppDbContext _context;
				private readonly CancellationToken _token;

				public BlobFileRepo(AppDbContext context, CancellationToken token)
				{
						_context = context;
						_token = token;
				}

				public async Task<BlobFile?> GetOneFileinfo(Guid id)
				{
						return await _context.Files.Where(e => e.Id == id).FirstOrDefaultAsync(_token);
				}

				public async Task<Uri?> CreateServiceSASContainer(
								BlobContainerClient containerClient,
								string storedPolicyName = null
						)
				{
						if (containerClient.CanGenerateSasUri)
						{
								// Create a SAS token that's valid for one day
								BlobSasBuilder sasBuilder = new BlobSasBuilder()
								{
										BlobContainerName = containerClient.Name,
								};

								if (storedPolicyName == null)
								{
										sasBuilder.ExpiresOn = DateTimeOffset.UtcNow.AddHours(1);
										sasBuilder.SetPermissions(BlobContainerSasPermissions.Read);
								} 
								else
								{
										sasBuilder.Identifier = storedPolicyName;
								}

								Uri sasURI = containerClient.GenerateSasUri(sasBuilder);

								return sasURI;
						}

						else
						{
								// Client object is not authorized via Shared Key
								return null;
						}
				}



		}
}
