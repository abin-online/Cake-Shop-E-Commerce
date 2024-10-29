# syntax=docker/dockerfile:1

# Define the Node.js version as an argument
ARG NODE_VERSION=20.8.0

# Use the specified Node.js version with Alpine for a smaller image
FROM node:${NODE_VERSION}-alpine

# Set the environment to production
ENV NODE_ENV production

# Set the working directory in the container
WORKDIR /usr/src/app

# Install dependencies using cache and bind mounts for efficiency
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Run the application as a non-root user
USER node

# Copy the rest of the application code into the image
COPY --chown=node:node . .

# Expose the port that the application listens on
EXPOSE 3000

# Command to run the application
CMD ["node", "app.js"]
