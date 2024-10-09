![image](https://github.com/user-attachments/assets/75214b94-660e-4e69-bad7-0743896091b2)

# 🚀 instant mock

<img width="736" alt="image" src="https://github.com/user-attachments/assets/69267572-f6a4-40f3-90a5-fa95af796645">

## 🚀 Quick Start

```bash
mv .env.example .env
# 🤫 add your apollo key to .env 🤫
docker compose up
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

## Running Locally

Copy the .env.example from the root into `backend` and fill in apollo key. 

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

