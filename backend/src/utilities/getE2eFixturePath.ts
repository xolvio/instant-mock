import { format } from 'date-fns';

export const getE2eFixturePath = () => {
    const timestamp = format(new Date(), 'yyyyMMdd');
    const path = `test/e2e/fixtures/apollo-platform-api/${timestamp}`;
    console.log(`E2E Fixture Path: ${path}`);
    return path;
};
