'use client';

import {Seed} from '@/models/Seed';
import React, {useEffect, useRef, useState} from 'react';
import {useParams} from 'react-router';
import {Button} from './button';
import {Card, CardContent, CardHeader, CardTitle} from './card';

export default function SeedDetails() {
  const {proposalId, seedId} = useParams<{
    proposalId: string;
    seedId: string;
  }>();
  const [seed, setSeed] = useState<Seed | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedMatchArguments, setEditedMatchArguments] = useState<string>('');
  const [editedResponse, setEditedResponse] = useState<string>('');

  const matchArgumentsRef = useRef<HTMLPreElement>(null);
  const responseRef = useRef<HTMLPreElement>(null);

  const operationName = seed?.operationName;
  // TODO I think this should be name, id can be confusing
  const seedGroupId = seed?.seedGroup;
  const operationMatchArguments = seed?.operationMatchArguments
    ? seed.operationMatchArguments
    : {};
  const seedResponse = seed?.seedResponse ? seed.seedResponse : {};
  const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchSeed();
  }, [seedId, apiUrl]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const fetchSeed = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/seeds/${seedId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch seed data');
      }

      const data = await response.json();
      console.log(seed);
      setSeed(data);
      setEditedMatchArguments(
        JSON.stringify(data.operationMatchArguments, null, 2)
      );
      setEditedResponse(JSON.stringify(data.seedResponse, null, 2));
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (matchArgumentsRef.current) {
      matchArgumentsRef.current.textContent = JSON.stringify(
        operationMatchArguments,
        null,
        2
      );
    }
    if (responseRef.current) {
      responseRef.current.textContent = JSON.stringify(seedResponse, null, 2);
    }
  };

  const handleSave = async () => {
    try {
      const updatedMatchArguments =
        matchArgumentsRef.current?.textContent || '';
      const updatedResponse = responseRef.current?.textContent || '';

      setEditedMatchArguments(updatedMatchArguments);
      setEditedResponse(updatedResponse);

      // Prepare the payload for the PATCH request
      const payload = {
        id: seedId,
        operationName: operationName,
        seedResponse: JSON.parse(updatedResponse), // Updated response
        operationMatchArguments: JSON.parse(updatedMatchArguments),
        seedGroupId: seedGroupId,
        graphId: seed?.graphId,
        variantName: seed?.variantName,
        oldOperationMatchArguments: operationMatchArguments,
      };

      const response = await fetch(
        `${apiUrl}/api/seeds?variantName=${seed?.variantName}&graphId=${seed?.graphId}`,
        {
          method: 'PATCH', // Use PATCH method for update
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      fetchSeed();

      if (!response.ok) {
        throw new Error('Failed to update seed data');
      }

      const updatedSeed = await response.json();
      setSeed(updatedSeed); // Update the state with the new seed data
      setIsEditing(false); // Exit editing mode
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
    <div className="flex justify-center items-start p-4 bg-muted/40">
      <div className="w-full max-w-4xl space-y-4">
        {/*TODO improve loading*/}
        {/*TODO add an error page when a seed with given ID doesn't exist*/}
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : seed ? (
          <>
            <Card className="mb-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Seed details</CardTitle>
                {!isEditing && <Button onClick={handleEdit}>Edit</Button>}
                {isEditing && (
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-2">
                  <span>{`Operation name: ${operationName}`}</span>
                </div>
                <div className="flex items-center mb-2">
                  <span>{`Sequence ID: ${seedGroupId}`}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="mb-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Matching arguments</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <pre
                  ref={matchArgumentsRef}
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  className={`bg-gray-100 p-4 rounded overflow-auto focus:border-primary focus:outline-none ${
                    isEditing
                      ? 'border-[1px] border-[hsl(var(--primary))]'
                      : 'border-[1px] border-transparent'
                  }`}
                  style={{minHeight: '100px'}}
                >
                  <code className="text-sm">
                    {JSON.stringify(operationMatchArguments, null, 2)}
                  </code>
                </pre>
              </CardContent>
            </Card>

            <Card className="mb-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Response</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <pre
                  ref={responseRef}
                  contentEditable={isEditing}
                  suppressContentEditableWarning={true}
                  className={`bg-gray-100 p-4 rounded overflow-auto focus:border-primary focus:outline-none ${
                    isEditing
                      ? 'border-[1px] border-[hsl(var(--primary))]'
                      : 'border-[1px] border-transparent'
                  }`}
                  style={{minHeight: '100px'}}
                >
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
}
