'use client';

import {getApiBaseUrl} from '../../config';
import {AlertTriangle, CheckCircle2, Copy, Plus, Trash2} from 'lucide-react';
import {useEffect, useState} from 'react';
import {Alert, AlertDescription, AlertTitle} from './alert';
import {Button} from './button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';
import {Input} from './input';
import {useToast} from './use-toast';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  isVisible: boolean;
}

export default function SettingsPage() {
  const [apolloApiKey, setApolloApiKey] = useState('');
  const [isApolloKeySaved, setIsApolloKeySaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {toast} = useToast();
  const serverBaseUrl = getApiBaseUrl();

  useEffect(() => {
    fetch(`${serverBaseUrl}/api/apollo-api-key`)
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then((data) => {
        if (data.key) {
          setApolloApiKey(data.key);
          setIsApolloKeySaved(true);
        }
      })
      .catch((error) => console.error('Error fetching API key:', error));
  }, []);

  const handleSaveApolloApiKey = () => {
    setIsLoading(true);
    fetch(`${serverBaseUrl}/api/apollo-api-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({key: apolloApiKey}),
    })
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false);
        if (data.key) {
          setApolloApiKey(data.key);
          setIsApolloKeySaved(true);
          toast({
            title: 'Apollo API Key Saved',
            description: 'Your Apollo API key has been saved successfully.',
          });
        }
      });
  };

  const handleDeleteApolloApiKey = () => {
    setIsLoading(true);
    fetch(`${serverBaseUrl}/api/apollo-api-key`, {
      method: 'DELETE',
    }).then(() => {
      setApolloApiKey('');
      setIsLoading(false);
      setIsApolloKeySaved(false);
      toast({
        title: 'Apollo API Key Deleted',
        description: 'Your Apollo API key has been deleted.',
        variant: 'destructive',
      });
    });
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Apollo API Settings</CardTitle>
          <CardDescription>Manage your Apollo API key here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isApolloKeySaved ? (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span>Apollo API Key: {apolloApiKey}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <label
                  htmlFor="apolloApiKey"
                  className="text-sm font-medium leading-none"
                >
                  Apollo API Key
                </label>
                <Input
                  id="apolloApiKey"
                  placeholder="Enter your Apollo API key"
                  value={apolloApiKey}
                  onChange={(e) => setApolloApiKey(e.target.value)}
                  type="password"
                />
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {isApolloKeySaved ? (
            <Button
              variant="destructive"
              onClick={handleDeleteApolloApiKey}
              disabled={isLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Key
            </Button>
          ) : (
            <Button
              onClick={handleSaveApolloApiKey}
              disabled={!apolloApiKey || isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Key'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
