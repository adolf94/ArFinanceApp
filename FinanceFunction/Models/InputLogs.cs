using System.ComponentModel.DataAnnotations;
using UUIDNext;

namespace FinanceFunction.Models;

public class InputLogs
{
	[Key]
	public Guid Guid { get; set; } = Uuid.NewSequential();
	public DateTime DateLogged { get; set; }
	public string Path { get; set; } = string.Empty;
	public string Email { get; set; } = string.Empty;
	public string IpAddress { get; set; } = string.Empty;
	public string StatusCode { get; set; } = string.Empty;
	public Guid? UserId { get; set; }
	[MaxLength(100)]
	public string PartitionKey { get; init; } = "default";

}