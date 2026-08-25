# Stage 1 — build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app
COPY backend/SmartDesk.Api/*.csproj ./
RUN dotnet restore
COPY backend/SmartDesk.Api/. ./
RUN dotnet publish -c Release -o /app/publish

# Stage 2 — runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .
ARG PORT=8080
ENV ASPNETCORE_URLS=http://+:${PORT}
ENTRYPOINT ["dotnet", "SmartDesk.Api.dll"]