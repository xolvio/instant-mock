import React, {useEffect, useState} from 'react';
import {Link as RouterLink, useLocation} from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from './breadcrumb';
import {useParams} from 'react-router';
import {Seed} from '@/models/Seed';

const SeedDetails = () => {
  const {proposalId, seedId} = useParams<{
    proposalId: string;
    seedId: string;
  }>();
  const [seed, setSeed] = useState<Seed | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const operationName = seed?.operationName;
  const sequenceId = seed?.sequenceId;
  const operationMatchArguments = seed?.operationMatchArguments
    ? JSON.parse(seed.operationMatchArguments)
    : {};
  const seedResponse = seed?.seedResponse ? JSON.parse(seed.seedResponse) : {};
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    // Fetch seed data from the API
    const fetchSeed = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiUrl}/api/seeds/${seedId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch seed data');
        }

        const data = await response.json();
        setSeed(data);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchSeed();
  }, [seedId]);

  return (
    <div className="flex justify-center items-start p-4 bg-muted/40">
      <div className="w-full max-w-4xl space-y-4">
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <RouterLink to="/">Proposals Dashboard</RouterLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <RouterLink to={`/proposals/${proposalId}`}>
                  Proposal details
                </RouterLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Seed Details</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : seed ? (
          <>
            <Card x-chunk="dashboard-07-chunk-5" className="mb-4">
              <CardHeader>
                <CardTitle>Seed details</CardTitle>
                <CardDescription>
                  <div className="flex items-center mb-2">
                    <span>{`Operation name: ${operationName}`}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <span>{`Sequence ID: ${sequenceId}`}</span>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>
            <Card x-chunk="dashboard-06-chunk-0" className="mb-4">
              <CardHeader className="flex flex-row items-center">
                <div>
                  <CardTitle>Matching arguments</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <pre className="bg-gray-100 p-4 rounded overflow-auto">
                  <code className="text-sm">
                    {JSON.stringify(operationMatchArguments, null, 2)}
                  </code>
                </pre>
              </CardContent>
            </Card>

            <Card x-chunk="dashboard-06-chunk-0" className="mb-4">
              <CardHeader className="flex flex-row items-center">
                <div>
                  <CardTitle>Response</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <pre className="bg-gray-100 p-4 rounded overflow-auto">
                  <code className="text-sm">
                    {JSON.stringify(seedResponse, null, 2)}
                  </code>
                </pre>
              </CardContent>
            </Card>
          </>
        ) : (
          <p>No seed data found.</p>
        )}
      </div>
    </div>
  );
};

export default SeedDetails;
