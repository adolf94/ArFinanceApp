# Start from the base Python Dev Container image
FROM mcr.microsoft.com/devcontainers/python:3.10

# Install Azure Functions Core Tools (V4 is current)
# This uses npm, so Node.js is implicitly available in the base image.
RUN npm install -g azure-functions-core-tools@4 --unsafe-perm true