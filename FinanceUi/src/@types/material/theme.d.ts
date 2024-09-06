import { Theme, ThemeOptions } from "@mui/material/styles";
import { TypographyStyleOptions } from "@mui/material/styles/createTypography";

declare module "@mui/material/styles" {
  interface CustomTheme extends Theme {
    typography: {
      transactionHeaderDate: TypographyStyleOptions;
    };
  }
  // allow configuration using `createTheme`
  interface CustomThemeOptions extends ThemeOptions {
    typography: {
      transactionHeaderDate: TypographyStyleOptions;
    };
  }

  export function createTheme(options?: CustomThemeOptions): CustomTheme;
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    transactionHeaderDate: true;
  }
}
