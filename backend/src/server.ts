import express from "express";
import path from "path";
import cors from "cors";
import mockInstances from "./mockInstances";
import {initializeDatabase} from "./database/database";
import seedsRoutes from './routes/seeds.routes';
import proposalsRoutes from './routes/proposals.routes';
import mocksRoutes from './routes/mocks.routes';
import {MockService} from "./service/mockService";
import {ProposalService} from "./service/proposalService";
import proposals from "./proposals";
import swaggerJsdoc from 'swagger-jsdoc';

import swaggerUi from "swagger-ui-express";

var proxy = require("express-http-proxy");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;
export const GRAPH_ID = "dev-federation-x02qb";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../../frontend/build")));
app.use("/api", seedsRoutes);
app.use("/api", proposalsRoutes);
app.use("/api", mocksRoutes);
const mockService = MockService.getInstance();
const proposalService = new ProposalService();

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Instant Mock',
            version: '1.0.0',
        },
    },
    apis: ['./backend/src/routes/*.ts', './backend/src/server.ts'],
};

const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Proxy setup to route requests dynamically based on proposal ID in the path
/**
 * @openapi
 * /{proposalId}/graphql:
 *   post:
 *     summary: Proxy GraphQL requests to the appropriate service
 *     description: |
 *       This endpoint dynamically proxies GraphQL requests based on the `proposalId` in the URL. The `proposalId` is used to determine the appropriate backend service to route the request to. The proxy forwards the request to the corresponding GraphQL server running on a different port.
 *
 *       **How it works:**
 *       - The `proposalId` is extracted from the URL.
 *       - The corresponding backend service for the `proposalId` is identified.
 *       - The request is forwarded to the backend service.
 *       - The response from the backend service is returned to the client.
 *     tags:
 *       - GraphQL Proxy
 *     parameters:
 *       - in: path
 *         name: proposalId
 *         required: true
 *         description: The ID of the proposal to route the request to.
 *         schema:
 *           type: string
 *           example: "dev"
 *     responses:
 *       200:
 *         description: Successfully proxied the request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example: { "data": { "field": "value" } }
 *       500:
 *         description: Error forwarding the request to the backend service.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error forwarding request"
 */
app.use(
    "/:proposalId/graphql", // Include proposalId as part of the route path
    proxy(
        (req: { params: { proposalId: string } }) => {
            const proposalId = req.params.proposalId; // Extract proposalId from the path

            const proposal = proposals[proposalId];
            const port = proposal.port;
            mockService.startNewMockInstanceIfNeeded(proposalId).then(r => console.log(`Proxy to port ${port}`));
            return `http://localhost:${port}`;
        },
        {
            proxyReqPathResolver: () => {
                return "/graphql";
            },
            userResDecorator: (proxyRes: any, proxyResData: any) => {
                // Optionally modify the response before sending it back to the client
                return proxyResData;
            },
        },
    ),
);

// Optionally, create an endpoint to stop a mocking service
app.post("/api/stop-mock", async (req, res) => {
    const variantName = req.query.variantName as string;

    if (!variantName) {
        return res.status(400).send("Proposal ID is required");
    }

    const instance = mockInstances[variantName];
    if (!instance) {
        return res
            .status(404)
            .send(`No active mocking service for proposal ID ${variantName}`);
    }

    try {
        await instance.service.stop();
        delete mockInstances[variantName]; // Remove from the map
        res.send({
            message: `Mocking service for proposal ID ${variantName} stopped successfully`,
        });
    } catch (error) {
        console.error("Error stopping mocking service:", error);
        res.status(500).send("Error stopping mocking service");
    }
});

app.get("/api/server-status", (req, res) => {
    const variantName = req.query.variantName as string;

    if (!variantName) {
        return res.status(400).send("Variant name is required");
    }

    const status = variantName in mockInstances ? "running" : "stopped";
    res.json({status: status});
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/build", "index.html"));
});

initializeDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
        return proposalService.fetchProposalsFromApollo();
    })
    .then((proposals) => {
        console.log("Proposals fetched");
    })
    .catch((error) => {
        console.error("Error starting InstantMock:", error);
        process.exit(1);
    });
