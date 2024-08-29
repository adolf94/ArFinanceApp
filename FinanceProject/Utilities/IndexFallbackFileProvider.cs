
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Primitives;
using System.Linq;

namespace FinanceApp.Utilities
{
    public class IndexFallbackFileProvider : IFileProvider
    {
        private readonly PhysicalFileProvider _innerProvider;

        public IndexFallbackFileProvider(PhysicalFileProvider physicalFileProvider)
        {
            _innerProvider = physicalFileProvider;
        }

        public IDirectoryContents GetDirectoryContents(string subpath)
        {
            return _innerProvider.GetDirectoryContents(subpath);
        }

        public IFileInfo GetFileInfo(string subpath)
        {
            var fileInfo = _innerProvider.GetFileInfo(subpath);
            if (!fileInfo.Exists && MustFallbackToIndex(subpath))
            {
                if (!_staticFilesFolders.Any(f => subpath.Contains(f)))
                {
                    fileInfo = _innerProvider.GetFileInfo("/index.html");
                }
            }

            return fileInfo;
        }

        // Plain 404 are OK for css, img, js.
        private static string[] _staticFilesFolders = new string[] { "/css/", "/img/", "/js/" };
        private static bool MustFallbackToIndex(string subpath)
        {
            return true;
            //return !_staticFilesFolders.Any(f => subpath.Contains(f));
        }

        public IChangeToken Watch(string filter)
        {
            return _innerProvider.Watch(filter);
        }
    }
}
