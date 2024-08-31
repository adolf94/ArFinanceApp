using FinanceProject.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceProject.Controllers
{
		[ApiController]
		public class WeatherForecastController : ControllerBase
		{
				private static readonly string[] Summaries = new[]
				{
				"Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
		};

				private readonly ILogger<WeatherForecastController> _logger;
				private readonly AppDbContext _context;

				public WeatherForecastController(ILogger<WeatherForecastController> logger, AppDbContext context)
				{
						_logger = logger;
						_context = context;
				}


				[HttpGet("ConnectDb")]
				public async Task<IActionResult> DbConnection()
				{
						try
						{
								_context.Database.ExecuteSqlRaw("Select 1");
								return Ok("Db Success");

						}
						catch (Exception ex)
						{
								return await Task.FromResult(Ok("Db Failed"));

						}



				}


				[HttpGet("Weatherforecast")]
				public IEnumerable<WeatherForecast> Get()
				{
						return Enumerable.Range(1, 5).Select(index => new WeatherForecast
						{
								Date = DateTime.Now.AddDays(index),
								TemperatureC = Random.Shared.Next(-20, 55),
								Summary = Summaries[Random.Shared.Next(Summaries.Length)]
						})
						.ToArray();
				}
		}
}