# Node.js + MongoDB Dockerized Application

This project contains a Docker setup for a Node.js application that uses MongoDB as the database. The setup includes configurations for production builds, dependency caching, and persistent data storage.

## Project Structure

- **Dockerfile**: Defines the build process for the Node.js application container.
- **docker-compose.yml**: Configures the services: a MongoDB database and the application itself.
- **Volumes**: Persistent storage is enabled for MongoDB data and uploaded images.

## Requirements

- [Docker](https://docs.docker.com/get-docker/) 20.10+
- [Docker Compose](https://docs.docker.com/compose/install/) 1.27+

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

2. **Set up environment variables**: Define the `.env` file in the project root as per your application's requirements (e.g., `SECRETKEY`).

3. **Build and start services**:
   Run the following command to build the Docker images and start both MongoDB and the application:
   ```bash
   docker-compose up -d
   ```

4. **Access the application**:
   The app will be available at `http://localhost:3000`.

## Configuration Overview

### Dockerfile
The `Dockerfile` is designed for a production environment. Key steps include:

- **Node.js Base Image**: Uses the official [Node.js image](https://hub.docker.com/_/node) with Alpine for a minimal setup.
- **Environment Variables**: `NODE_ENV` is set to production.
- **Dependency Management**: Uses bind mounts and caching for efficient `npm ci` installation.
- **Non-root User**: Runs the application as a non-root user for security.
- **Port Exposure**: Exposes port 3000 by default.

### docker-compose.yml

- **mongo** service: Creates a MongoDB container, exposing port 27017 and using a persistent volume for data storage.
- **app** service: Builds the application using the `Dockerfile` and mounts the product images for persistent storage.
- **Environment Variables**: Sets `SECRETKEY`, `MONGODB`, and `NODE_TLS_REJECT_UNAUTHORIZED` for the Node.js container.
- **Volume Mappings**: Ensures data persistence for MongoDB and uploaded product images.

## Persistent Volumes

The `mongo_data` volume retains MongoDB data between container restarts. Additionally, the `./public/images/products` directory is mounted in the `app` service to retain uploaded images.

## Official Documentation

- [Node.js Docker Official Image](https://hub.docker.com/_/node)
- [MongoDB Docker Official Image](https://hub.docker.com/_/mongo)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## Running Commands

To start and stop the application:

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down
```

## Troubleshooting

If you encounter issues, please refer to the [Docker Documentation](https://docs.docker.com/get-started/) for general troubleshooting steps, or the [Node.js Docker Official Image documentation](https://hub.docker.com/_/node) for Node.js-specific issues.

---

Happy coding!
```

This README provides a comprehensive overview, making it easy for others to understand and use your setup. Let me know if you need further customization!