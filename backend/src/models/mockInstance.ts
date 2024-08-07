import GraphqlMockingService from "@wayfair/gqmock";

export interface MockInstance {
    port: number;
    service: GraphqlMockingService;
}
