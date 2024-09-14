#See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:9.0-preview AS base
USER app
WORKDIR /app
ENV ConnectionStrings__AzureSql=secret
ENV AppConfig__authConfig__redirect_uri=secret
ENV AppConfig__authConfig__redirect_issuer=https://adolfrey.com
ENV AppConfig__authConfig__client_secret=secret
ENV AppConfig__jwtConfig__issuer=secret
ENV AppConfig__jwtConfig__secret_key=secret
ENV ENV_PASSKEY=secret
ENV TZ=Asia/Singapore
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