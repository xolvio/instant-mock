# Instant Mock - GraphQL Mocking Server POC

Instant Mock is a proof-of-concept GraphQL mocking server for development and testing.

## Local Deployment

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

4. **Environment Variables:**
   * An `APOLLO_API_KEY` is required in a `.env` file.

## Docker Deployment

1. **Build Image:**

   ```bash
   docker build -t xolvio/instant-mock .
   ```

2. **Run Container:**

   ```bash
   docker run xolvio/instant-mock
   ```

*Note: Docker Compose is not supported due to networking limitations.*

