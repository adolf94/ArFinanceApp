using System.Buffers;
using System.Buffers.Text;
using System.Text;
// NOTE: Base64Url is in System.Buffers.Text

// Utility class to decode Base64URL strings safely
public static class Base64UrlHelper
{
		public static byte[] DecodeBase64Url(string base64Url)
		{
				// 1. Get the max possible decoded length (it's safe to overestimate)
				int maxDecodedLength = Encoding.ASCII.GetMaxByteCount(base64Url.Length);

				// 2. Allocate the destination buffer
				Span<byte> decodedBytes = maxDecodedLength > 1024
						? new byte[maxDecodedLength]
						: stackalloc byte[maxDecodedLength];

				// 3. Decode the string characters (chars) into the byte span
				OperationStatus status = Base64Url.DecodeFromChars(
						base64Url.AsSpan(),
						decodedBytes,
						out int charsConsumed,
						out int bytesWritten
				);

				if (status == OperationStatus.Done)
				{
						// 4. Return the actual written bytes
						return decodedBytes.Slice(0, bytesWritten).ToArray();
				}

				// Handle errors (e.g., InvalidData)
				throw new FormatException($"Failed to decode Base64URL string. Status: {status}");
		}
}