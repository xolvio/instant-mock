# 🚀 @xolvio/instant-mock

InstantMock is an **enterprise-ready Express.js server** and **React UI** for creating and distributing **GraphQL mock servers**—designed to simplify API mocking across development teams.

With **first-class Apollo Federation integration**, you can instantly mock any **Supergraph, Subgraph, or Schema Proposal**.

> **Not using Apollo?** No worries! InstantMock supports any valid GraphQL schema.

## ⏩ Quick Start

### Requirements

- **Apollo Studio**: [Generate a `user:` API key here](https://studio.apollographql.com/user-settings/api-keys) if using Apollo Studio schemas.
- **Local Files**: To use schema files, place `.graphql` files in `backend/src/graphql`.

### Running Locally

**Clone the repo** and run:

```shell
npm start
```

Or use Docker Compose:

```shell
docker compose up
```

Or, if you don't want to clone the repo, pull from Docker Hub:

```shell
docker pull xolvio/instant-mock:<version>
docker run -it -p 3033:3033 xolvio/instant-mock:<version>
```

InstantMock will be available on http://localhost:3033.

To connect with Apollo, go to the settings page and enter your key: http://localhost:3033/settings.

> 🔮 **Coming Soon**: `npx create-instant-mock` for even quicker start.

## 💡 Why InstantMock?

### Problem
GraphQL Federation teams often struggle with:
- Managing complex supergraph schemas across teams
- Maintaining consistent mock data
- Time spent creating and updating mock servers
- Integration testing with proposed schema changes

### Solution
InstantMock provides:
- Centralized mock data management
- Native Federation support (supergraphs/subgraphs)
- GUI for creating and managing mocks
- Instant deployment of mock responses

### Enterprise Features
- **Security**: Encryption key management, secure data storage
- **Infrastructure**: HTTP proxy support, K8s-ready deployment
- **Flexibility**: SQLite, PostgreSQL, or MySQL support
- **Data Control**: Idempotent seed management with group organization
- **SSO Support**: Currently support Github and Azure SSO. 

### Key Benefits
- **Faster Development**: Create and share mocks in minutes
- **Better Testing**: Consistent mock data across teams
- **Federation Ready**: Test schema changes before deployment
- **No Setup**: Replace local mock servers and manual JSON files

> 🔮 **Coming Soon**: More SSO provider support, file uploads, and enhanced Helm charts with PostgreSQL

## 🚢 Deployment Options

### Docker

InstantMock is containerized for easy deployment in Docker-supported environments.

```shell
docker pull xolvio/instant-mock:<version>
```

### Kubernetes (K8s)

A basic Helm chart is provided to deploy InstantMock with Kubernetes. Currently,
it ships with SQLite and is limited to a single replica.

> 🔮 **Coming Soon**: Full Helm chart with scaling support and PostgreSQL.

## 🚢 Kubernetes Deployment with Istio

### Basic Installation

InstantMock is designed to work seamlessly with Istio service mesh. To deploy:

1. Add the Helm repository
2. Create a values file with your domain configuration
3. Install using Helm

The minimal configuration requires:

- Your domain name
- Istio gateway configuration
- Backend URL (matching your domain)

### Example Values File

Create a `my-values.yaml` with your configuration:

- Set ingress.hosts[0].host to your domain
- Set env.BACKEND_URL to match your domain
- Set env.BACKEND_PROTO to match your web server protocal (http or https, http is default)
- Keep service.type as ClusterIP (Istio handles external access)
- Port 80 is used internally (Istio handles SSL/TLS)

### Installation Command

Run Helm install with your values:

    helm install instant-mock ./helm -f my-values.yaml

### Accessing the Application

Once deployed:

1. Configure your Istio Gateway
2. Point your domain DNS to the Istio ingress gateway
3. Access InstantMock through your configured domain

The application automatically detects the environment and configures itself for
production use.

> Note: SSL/TLS termination is handled by Istio at the gateway level

## 🙏 Acknowledgments

InstantMock builds on the work from gqmock, with many of the base MockServer
utilities adapted and extended for seamless integration.

> Made with ❤️ by the @xolvio team
