using System.Text.Json;
using System.Text.Json.Serialization;

namespace FinanceProject.Utilities
{
		public class NullableDateTimeConverter : JsonConverter<DateTime?>
		{
				public override DateTime? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
				{
						return reader.TryGetDateTime(out var value) ? value.ToUniversalTime() : null;
				}

				public override void Write(Utf8JsonWriter writer, DateTime? value, JsonSerializerOptions options)
				{
						if (value.HasValue)
						{
								writer.WriteStringValue(value.Value.ToUniversalTime());
						}
						else
						{
								writer.WriteNullValue();
						}
				}
		}
		public class DateTimeConverter : JsonConverter<DateTime>
		{
				public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
				{
						return DateTime.Parse(reader.GetString());
				}

				public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
				{
						writer.WriteStringValue(value.ToUniversalTime().ToString("yyyy'-'MM'-'dd'T'HH':'mm':'ssZ"));
				}
		}
}
