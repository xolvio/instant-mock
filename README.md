# Instant Mock

Current State: POC showing support for mocking multiple GraphQL supergraphs and 
with persisted seed storage.

## Local Deployment

Make sure a `backend/.env` is provided with the `APOLLO_API_KEY` var set.

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

