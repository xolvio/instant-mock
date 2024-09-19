# ❗❗❗ This project is currently under heavy development, with plans for a full rewrite in the coming months. ❗❗❗

# 🚀 instant mock

**instant mock** is a powerful tool that helps developers quickly create GraphQL endpoints for seamless alignment between front-end and back-end teams. Whether you're working with a small team or an enterprise, **instant mock** has you covered with robust features, including Apollo Studio schema proposal integration.

## 🌟 Key Features

- **Instant GraphQL Endpoint Creation**: Get a mock GraphQL endpoint up and running in no time, so your team can start coding against it instantly.

- **Apollo Studio Schema Proposal Integration**:
    - 🎉 **Highlight Feature**: Seamlessly create mocks from schema proposals with full access to all schemas within the mock.
    - 📚 **Multiple Schema Support**: Host multiple mocks from different schema proposals, allowing for advanced testing and development.

- **Realistic Mock Responses**:
    - 🎭 Get fake responses tailored to your schema, with the ability to refine these as your project evolves.
- **Advanced Data Seeding**:
    - 🌱 Seed your mock data with basic or advanced options, enabling realistic testing scenarios.
    - 🛠️ Pre-fill seed data with advanced sets of proposals for more tailored testing.

- **Flexible Hosting Options**:
    - 🖥️ Run locally for quick testing.
    - 🐳 Use Docker for a containerized setup.
    - 🏢 Works with corporate proxy
    - ☁️ Host centrally to share the mock with multiple teams, ensuring everyone is on the same page.
        - 🌐 Provided AWS CDK template for easy deployment to AWS
        - 🌐 More soon


## 🚀 Quick Start

1. **Install instant mock**:
   ```bash
   npm install instant-mock
   ```

1. **Access your mock in Apollo Studio**:
    - Connect to your schema proposals and start using the mock endpoint.



## 🛠️ Advanced Usage

- **Hosting Multiple Mocks**: Create and manage multiple mocks for different schema proposals, perfect for large teams with complex requirements.
- **Data Seeding**: Utilize advanced data seeding techniques to populate your mocks with realistic data, ensuring your tests are as close to production as possible.

## 📚 Documentation

Check out our [full documentation](https://your-documentation-link.com) for more detailed instructions and advanced usage examples.

## 🤝 Contributing

We welcome contributions! Please read our [contributing guide](CONTRIBUTING.md) to get started.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.



---------

THE ABOVE IS A TEMPLATE GENERATED BY AI. Looks great, probabyl sucks as content


Here is the real content:



## 🤖 API
use the api to create a mock programmatically. Here's an example:

#### GRAPHQL API
```graphql
  # create a mock
  # create a seed
```

#### REST API


### Graphs

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


#### PROGRAMMATIC API

#### GRAPHICAL UI


# For Enterprise Supergraph Teams

## Creating and sharing an InstantMock
1. Look at your wireframes and determine the demand for data
2. Identify the gaps in your schema
3. Create a schema proposal in Apollo Studio
4. Once the schema proposal passes Apollo's composition checks, it will show up in InstantMock
5. Pick the schema proposal from within InstantMock to see the endpoint and header details you need
6. Make a call to the endpoint with the header info, and correctly typed fake responses for all operation permutations from your Supergraph
7. Share the mock with your team and profit!

## Idempotent Mocks
InstantMock supports powerful data seeding and sequencing capabilities.

Imagine that you are creating an end-to-end experience that spans across multiple services. The UI state depends on the sequence of queries and mutations being routed to disparate Subgraphs.

InstantMock allows you to create a sequence of operations that represent the state of your application.

Here's how you do it:
1. Once you have created an InstantMock for given schema proposal
2. Open the InstantMock UI at `<server-url>/seeds`, and click on "create a seed sequence" (or use the API)
3. You'll see a sequence UI where you can add / remove queries and mutations
4. For each operation, add a response. Note, you can click the "pre-fill" button to get a fake response to speed up the process
5. Repeat until you have a sequence that represents the experience you are building across the Subgraphs

Here's an example:
sequence [blah] = [
1. query > response [foo]
2. query > response [bar]
3. mutation > response ...
4. query > response [baz]
   ]

sequence [another] = [
1. query > response [bar]
2. query > response [bar]
3. query > response [baz]
   ]


## Using the InstantMock in development
* session id (client id today)
* sequenced state management (finite state machine)


## Phasing out InstantMocks

An InstantMock is intended to unblock development and testing. You can manually mark a sequence as "implemented" in InstantMock, or you can opt to track the status of the Schema in Apollo Studio. This will make the sequence throw an error if it is hit in the future, prompting you to update the sequence.

FUTURE SCOPE: Data pass-through where the mock will pass the request to the actual service and return responses that exist, and fake the data that is not yet implemented.


## Integration with Narrative
Use the Narrative Studio to create a narrative that represents the end-to-end experience you are building. The Narrative Studio will automatically create a sequence of operations to create seeds in InstantMock. Find out more at www.narrative.tech/instant-mock

## Suggested Workflow for Small Graph Teams (FUTURE)
1. Consume schema from a running server | push schema from CI
2. Determine the demand for data and create a schema delta



## Deployment

#### NPM
`npx run instant-mock`

#### Docker locally (pull image)

#### Future: Helm chart

#### Future: AWS CDK template


# Instant Mock

Current State: POC showing support for mocking multiple GraphQL supergraphs and 
with persisted seed storage.

## Local Deployment

Make sure a `backend/.env` is provided with the `APOLLO_API_KEY` var set and `frontend/.env` is provided with `REACT_APP_API_BASE_URL`, which points to the backend (defult `http://localhost:3001`).

1. **Install Node Version Manager (nvm):**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash`
   ```

2. **Frontend:**
   * Navigate to the `frontend` directory:

     ```bash
     cd frontend
     npm install
     npm run start
     ```
3. **Backend:**
   * Navigate to the `backend` directory in a new terminal:

     ```bash
     cd backend
     npm install
     npm run dev
     ```

## Docker Deployment

Make sure a `backend/.env` is provided with the `APOLLO_API_KEY` var set.

1. **Build Image:**

   ```bash
   docker build -t xolvio/instant-mock .
   ```

2. **Run Container:**

   ```bash
   docker run -d -p 3001:3001 xolvio/instant-mock                                                                           
   ```

*Note: Docker Compose is not supported due to networking limitations.*

