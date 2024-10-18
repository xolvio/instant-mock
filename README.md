# 🚀 InstantMock

As supergraphs scale, delays between front-end development, QA, and back-end API readiness can slow teams down. InstantMock allows you to mock your Supergraph endpoints as soon as you define the annotations you need, eliminating delays.

## Key Features
- **Instant GraphQL Endpoint Creation**: Get a mock endpoint up and running in minutes. 
- **Apollo Studio Schema Proposal Integration**: Create mocks directly for your schema proposals with full access to all schemas.
- **Realistic Mock Responses**: Tailor-made fake responses for accurate testing.
- **Advanced Data Seeding**: Populate your mocks with lifelike data for production-like testing scenarios.
- **Integration with Narrative Studio**: Fully integrated into Narrative Studio and supporting Narrative Driven Development (NDD)

InstantMock can:
- run Locally: Quick testing right on your machine.
- run inside of a Docker container: Use Docker for a containerized environment.
- be hosted centrally: Share mocks with multiple teams using our AWS CDK templates (coming soon).
- works with Corporate Proxies: Seamless integration in enterprise environments.

## 🚀 Quick Start

### 🐳 Docker (Recommended)
InstantMock runs by default on `localhost:3001`. If you want to run the app on another port, adjust the `PORT` and `REACT_APP_API_BASE_URL` variables in your `.env` file accordingly.

```bash
mv .env.example .env
# Add your Apollo key to the .env file
docker compose up
```

### 📦 NPM
#### Database
You will need a PostgreSQL database instance. You can either:
- Set one up locally,
- Use a remote instance, 
- Or use the PostgreSQL instance that is started automatically with the above docker compose config.
Make sure to adjust the database connection details in your .env file accordingly.

#### Server
The InstantMock server runs by default on port 3001. If you want to run the server on another port, adjust the `PORT` variable in your `.env` file. Also, remember to update the `REACT_APP_API_BASE_URL` in your `.env` file accordingly.
```bash
cd backend
mv .env.example .env
# Add your Apollo key to the .env file
# Add your database connection details to the .env file
npm install
npm run dev
```

#### Client
The InstantMock client runs by default on port 3000. If you want to run it on another port, adjust the `PORT` variable in your `.env` file.
```bash
cd frontend
mv .env.example .env
npm install
npm start
```

## API Reference

#### Get All Graphs
- **Endpoint:** `GET api/graphs`
- **Description:** Retrieves a list of all available graphs.
- **Response:** JSON array of graph objects.

#### Get Graph by ID
- **Endpoint:** `GET api/graphs/:graphId`
- **Description:** Retrieves the details of a specific graph by its `graphId`.
- **Parameters:**
    - `graphId` (path param): The ID of the graph.
    - `withSubgraphs` (query param): Optional boolean parameter. If set to true, the response will include the given graph along with all its subgraphs
- **Response:** JSON object of the requested graph. If withSubgraphs=true, the response will include the graph and all subgraphs of variants.

#### Create a new Proposal
- **Endpoint:** `POST api/graphs/:graphId/:variantName/proposals`
- **Description:** Creates a schema proposal for a specific variant of the graph.
- **Query Parameters:**
    - `graphId` (required): The ID of the graph.
    - `variantName` (required): The variant name of the graph.
- **Request Body:**
  ```json
  {
    "displayName": "string",
    "description": "string (optional)",
  }

### Seeds

#### Get All Seeds
- **Endpoint:** `GET api/seeds`
- **Description:** Retrieves a list of all seeds for a given graph and variant.
- **Query Parameters:**
    - `graphId` (required): The ID of the graph.
    - `variantName` (required): The variant name of the graph.
- **Response:** JSON array of seed objects.

#### Create a New Seed
- **Endpoint:** `POST api/seeds`
- **Description:** Creates a new seed for a specific graph and variant.
- **Query Parameters:**
    - `graphId` (required): The ID of the graph.
    - `variantName` (required): The variant name of the graph.
- **Request Body:**
  ```json
  {
    "seedResponse": { ... },
    "operationName": "string",
    "operationMatchArguments": { ... },
    "sequenceId": "string"
  }

#### Get Seed by ID
- **Endpoint:** `GET /seeds/:id`
- **Description:** Retrieves the details of a specific seed by its `id`.
- **Parameters:**
    - `id` (path param): The ID of the seed.
- **Response:** JSON object containing the requested seed details.

#### Delete Seed by ID
- **Endpoint:** `DELETE /seeds/:id`
- **Description:** Deletes a specific seed by its `id`.
- **Parameters:**
    - `id` (path param): The ID of the seed.
- **Response:** JSON object confirming the deletion of the seed.
