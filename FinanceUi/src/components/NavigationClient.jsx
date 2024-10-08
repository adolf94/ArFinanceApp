import { NavigationClient } from "@azure/msal-browser";
import history from "./History";
//export const history = createBrowserHistory({ basename: process.env.PUBLIC_URL });

/**
 * This is an example for overriding the default function MSAL uses to navigate to other urls in your webpage
 */
export class CustomNavigationClient extends NavigationClient {
  constructor(history) {
    super();
    this.history = history;
  }

  /**
   * Navigates to other pages within the same web application
   * You can use the useHistory hook provided by react-router-dom to take advantage of client-side routing
   * @param url
   * @param options
   */
  async navigateInternal(url, options) {
    const relativePath = url.replace(
      window.location.origin + "/" + process.env.PUBLIC_URL,
      "",
    );
    if (relativePath == "/Errors/401") return;
    history.push(relativePath);

    return false;
  }
}
