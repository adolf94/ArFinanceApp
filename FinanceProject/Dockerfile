#See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:9.0-preview AS base
USER app
WORKDIR /app
ENV ConnectionStrings__AzureSql=fWunINcFjFblo816B+22vrIbgarty8bbJM0vILv/O+cg9p/sWPJptyx4FsmuAqEGWy9O2AHxHn+1L541f+xGTSBGccA4Fv0IXphcK+WA+NS4SziJ33zHUbTfotkkTBjkLMRRRdjDCamH/+bdYXTFVfnAOVT3vNONFYlT2GAsOVebT/ujIj1MfDcMeqPvAUUmjOMB6C15/eaST2iJ8bQD6yt+pH5nTJLsZ2kTR84rp6KW2ePQwGAtN17QbCwVZqV/SbQS/YIEx5HRmsE+hVM1pxvf6lQgEaapp1rkLugPC1f39TcGVxIjsel/cSMNdS5gpwwyp6uybEk46IQfi3lT3tBITkozMhWruz2nbX+gp6Yon7Xs9XBBD3FescdNqH0oTMRagN8hwLlMZ2T4+6zv93b3TEK27OS7DOYfnGl7I3whl75mVWQA7v6VaLr4fLah
ENV AppConfig__authConfig__redirect_uri=secret
ENV AppConfig__authConfig__redirect_issuer=https://adolfrey.com
ENV AppConfig__authConfig__client_secret=secret
ENV AppConfig__jwtConfig__issuer=secret
ENV AppConfig__jwtConfig__secret_key=secret
ENV ENV_PASSKEY=secret
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:9.0-preview AS build
ARG BUILD_CONFIGURATION=Release
COPY . /src
WORKDIR "/src"
RUN dotnet restore "./FinanceApp.csproj"
RUN dotnet build "./FinanceApp.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./FinanceApp.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FinanceApp.dll"]