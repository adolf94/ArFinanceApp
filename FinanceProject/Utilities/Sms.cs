using FinanceProject.Models;
using FinanceProject.Utilities;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;

namespace FinanceApp.Utilities
{
		public class Sms
		{
				private readonly AppConfig _config;
				private readonly string _authorization;
				private readonly bool _enabled;
				private readonly IMemoryCache _cache;
				private readonly ILogger<Sms> _logger;


				public Sms(AppConfig config, ILogger<Sms> logger, IMemoryCache cache)
				{
						_config = config;
						_enabled = config.SmsConfig.Enabled;
						string passkey = Environment.GetEnvironmentVariable("ENV_PASSKEY")!;
						// string user = AesOperation.DecryptString(passkey, config.SmsConfig.Username);
							string pass = AesOperation.DecryptString(passkey, config.SmsConfig.Password);

						_cache = cache;
						_logger = logger;

						_authorization = pass;
				}


				public async Task<string> SendSms(string message, string number, bool includeAutomatedWaiver = false)
				{

						//TODO: add validation that number is a PH number;
						if (!number.StartsWith("9") ||  number.Length != 10)
						{
								throw new Exception("number is not a valid number");
						}

						if (!_enabled)
						{
								_logger.LogWarning($"SMS disabled!");
								_logger.LogDebug($"SMS \"sent\" to {number}: {message}");
								return Guid.NewGuid().ToString();
						}

						if (number.StartsWith("900"))
						{
							_logger.LogWarning($"SMS was not send to a dummy number");
							_logger.LogDebug($"SMS \"sent\" to {number}: {message}");
							return Guid.NewGuid().ToString();

						}


						var client = new HttpClient();
						client.DefaultRequestHeaders.Add("x-api-key", _authorization);


						var msg = new
						{
								message = message + (includeAutomatedWaiver ? "\n---\n This is an automated message(beta)" : ""),
								recipients = new[] { "+63" + number }
						};


						HttpResponseMessage resp = await client.PostAsJsonAsync(_config.SmsConfig.Endpoint, msg);
						string str = await resp.Content.ReadAsStringAsync();
						if (!resp.IsSuccessStatusCode)
						{
								SmsRequestFailedResponse failedResponse = JsonSerializer.Deserialize<SmsRequestFailedResponse>(str)!;
								_logger.LogError($"Send SMS to {number} failed: {failedResponse.message}");
								return "Failed";
						}

						SmsRequestResponse response = JsonSerializer.Deserialize<SmsRequestResponse>(str)!;
						return ""; //response.id;
				}


				public async Task<Guid> CreateOtp(string user, string mobileNumber)
				{

						var rand = new Random();
						var otp = rand.Next(10000000, 99999999);

						Guid id = Guid.NewGuid();

						OtpEntry item = new OtpEntry
						{
								Id = id,
								User = user,
								MobileNumber = mobileNumber,
								Otp = otp
						};



						string smsId = await SendSms("Your OTP is " + otp.ToString(), mobileNumber);
						item.SmsId = smsId;

						_cache.Set($"otp_{mobileNumber}_{id.ToString()}", item, new MemoryCacheEntryOptions
						{
								AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
						});
						return id;
				}



				public int ValidateOtp(string user, string mobileNumber, int otp, Guid id)
				{
						OtpEntry? item;

						_cache.TryGetValue($"otp_{mobileNumber}_{id.ToString()}", out item);


						if (item == null) return 0;
						if (item.User != user) return -1;
						if (item.Otp != otp) return -2;

						_cache.Remove($"otp_{mobileNumber}_{id.ToString()}");

						return 1;
				}



				public class OtpEntry
				{
						public Guid Id { get; set; }
						public string User { get; set; } = string.Empty;
						public string MobileNumber { get; set; } = string.Empty;
						public int Otp { get; set; }
						public string SmsId { get; set; } = string.Empty;
				}
				public class SmsRecipientStatus
				{
						public string phoneNumber { get; set; } = string.Empty;
						public string state { get; set; } = string.Empty;
				}
				public class SmsRequestResponse
				{
						public string id { get; set; } = string.Empty;
						public string state { get; set; } = string.Empty;
						public bool isEncrypted { get; set; }
						public IEnumerable<SmsRecipientStatus> recipients { get; set; } = new List<SmsRecipientStatus>();
				}
				public class SmsRequestFailedResponse
				{
						public string message { get; set; } = string.Empty;
				}
		}
}



//{
//		"phoneNumber": "+639151792560",
//            "state": "Pending"

//				}