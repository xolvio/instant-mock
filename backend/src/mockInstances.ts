import MockServer from './MockServer';

// graphId -> variantName -> MockServer
const mockInstances: Record<string, Record<string, MockServer>> = {};

export default mockInstances;
