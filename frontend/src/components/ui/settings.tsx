'use client';

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
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {toast} = useToast();

  useEffect(() => {
    const savedApolloApiKey = localStorage.getItem('apolloApiKey');
    if (savedApolloApiKey) {
      setApolloApiKey(savedApolloApiKey);
      setIsApolloKeySaved(true);
    }

    const savedApiKeys = localStorage.getItem('apiKeys');
    if (savedApiKeys) {
      setApiKeys(JSON.parse(savedApiKeys));
    }
  }, []);

  const handleSaveApolloApiKey = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem('apolloApiKey', apolloApiKey);
      setIsLoading(false);
      setIsApolloKeySaved(true);
      toast({
        title: 'Apollo API Key Saved',
        description: 'Your Apollo API key has been saved successfully.',
      });
    }, 1000);
  };

  const handleDeleteApolloApiKey = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.removeItem('apolloApiKey');
      setApolloApiKey('');
      setIsLoading(false);
      setIsApolloKeySaved(false);
      toast({
        title: 'Apollo API Key Deleted',
        description: 'Your Apollo API key has been deleted.',
        variant: 'destructive',
      });
    }, 1000);
  };

  const generateApiKey = () => {
    if (!newKeyName.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a name for your API key.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const newKey =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      const newApiKey: ApiKey = {
        id: Date.now().toString(),
        name: newKeyName,
        key: newKey,
        isVisible: true,
      };
      const updatedKeys = [...apiKeys, newApiKey];
      setApiKeys(updatedKeys);
      localStorage.setItem('apiKeys', JSON.stringify(updatedKeys));
      setNewKeyName('');
      setIsLoading(false);
      toast({
        title: 'API Key Generated',
        description: `A new API key "${newKeyName}" has been generated for your app.`,
      });
    }, 1000);
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: 'API Key Copied',
      description: 'The API key has been copied to your clipboard.',
    });
  };

  const deleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== id));
    localStorage.setItem(
      'apiKeys',
      JSON.stringify(apiKeys.filter((key) => key.id !== id))
    );
    toast({
      title: 'API Key Deleted',
      description: 'The selected API key has been deleted.',
      variant: 'destructive',
    });
  };

  const handleCopiedKey = (id: string) => {
    setApiKeys(
      apiKeys.map((key) => (key.id === id ? {...key, isVisible: false} : key))
    );
    localStorage.setItem(
      'apiKeys',
      JSON.stringify(
        apiKeys.map((key) => (key.id === id ? {...key, isVisible: false} : key))
      )
    );
    toast({
      title: 'API Key Copied',
      description: 'Make sure to store your API key securely.',
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
                <span>Apollo API Key is saved and active</span>
              </div>
            ) : (
              <div className="space-y-2">
                <label
                  htmlFor="apolloApiKey"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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

      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Generate API Keys</CardTitle>
          <CardDescription>
            Create and manage API keys for other apps to use your API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="newKeyName"
                className="text-sm font-medium leading-none"
              >
                New API Key Name
              </label>
              <div className="flex space-x-2">
                <Input
                  id="newKeyName"
                  placeholder="Enter a name for your new API key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
                <Button
                  onClick={generateApiKey}
                  disabled={isLoading || !newKeyName.trim()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Generate
                </Button>
              </div>
            </div>
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="border p-4 rounded-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{apiKey.name}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteApiKey(apiKey.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {apiKey.isVisible ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Input value={apiKey.key} readOnly />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyApiKey(apiKey.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Alert variant="default">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Warning</AlertTitle>
                      <AlertDescription>
                        Make sure to copy your API key now. You won't be able to
                        see it again!
                      </AlertDescription>
                    </Alert>
                    <Button
                      variant="secondary"
                      onClick={() => handleCopiedKey(apiKey.id)}
                    >
                      I've copied my key
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>API Key is saved and active</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
