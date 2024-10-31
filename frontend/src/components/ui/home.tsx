import {Seed} from '@/models/Seed';
import {ApolloSandbox} from '@apollo/sandbox/react';
import {HandleRequest} from '@apollo/sandbox/src/helpers/postMessageRelayHelpers';
import {zodResolver} from '@hookform/resolvers/zod';
import {ChevronsUpDown, Plus, Settings, User} from 'lucide-react';
import React, {useCallback, useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {useNavigate} from 'react-router';
import {z} from 'zod';
import logo from '../../assets/logo.png';
import {getSeeds} from '../../services/SeedService';
import {Button} from './button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './command';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';
import {Input} from './input';
import {Label} from './label';
import {Popover, PopoverContent, PopoverTrigger} from './popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './select';
import {Switch} from './switch';
import {Tabs, TabsContent, TabsList, TabsTrigger} from './tabs';
import {Textarea} from './textarea';
import {Toaster} from './toaster';
import {toast} from './use-toast';

const Home = () => {
  const navigate = useNavigate();
  const [selectedGraph, setSelectedGraph] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variants, setVariants] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [seedGroups, setSeedGroups] = useState([]);
  const [selectedSeedGroup, setSelectedSeedGroup] = useState(null);
  const [graphs, setGraphs] = useState([]);
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [newGroupName, setNewGroupName] = React.useState('');
  const [seedWithArguments, setSeedWithArguments] = useState(false);
  const [seeds, setSeeds] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSeed, setSelectedSeed] = useState(null);
  const [isSeedButtonVisible, setIsSeedButtonVisible] = useState(false);
  const serverBaseUrl = process.env.REACT_APP_API_BASE_URL;

  //TODO: refine names
  const [seedArgs, setSeedArgs] = useState('{}');
  const [seedResponse, setSeedResponse] = useState('');
  const [operationName, setOperationName] = useState('');

  const handleSettingsClick = () => navigate('/settings');
  const handleLogoClick = () => navigate('/graphs');

  useEffect(() => {
    const fetchSeedGroups = () => {
      console.log('Fetching seed groups...');
      return fetch(`${serverBaseUrl}/api/seedGroups`)
        .then((response) => response.json())
        .then((result) => {
          console.log('Seed groups fetched:', result);
          setSeedGroups(result);

          const defaultGroup = result.find((group) => group.id === 1);
          if (defaultGroup) {
            console.log('Default group found:', defaultGroup);
            setSelectedSeedGroup(defaultGroup);
          } else {
            console.warn('No default group found.');
          }

          return defaultGroup; // Return for use in next steps
        })
        .catch((error) => console.error('Error fetching seed groups:', error));
    };

    const fetchGraphDetails = (graphId) => {
      console.log(`Fetching details for graph ID: ${graphId}...`);
      return fetch(`${serverBaseUrl}/api/graphs/${graphId}`)
        .then((response) => response.json())
        .then((graphDetails) => {
          console.log('Graph details fetched:', graphDetails);
          setVariants(graphDetails.variants || []);
          setProposals(graphDetails.proposals || []);

          const firstVariant = graphDetails.variants?.[0];
          if (firstVariant) {
            console.log('First variant found:', firstVariant);
            setSelectedVariant(firstVariant);
          } else {
            console.warn('No variants found in graph details.');
          }

          return firstVariant; // Return for use in fetchSeeds
        })
        .catch((error) =>
          console.error(`Error fetching details for graph ${graphId}:`, error)
        );
    };

    const fetchGraphs = () => {
      console.log('Fetching graphs...');
      return fetch(`${serverBaseUrl}/api/graphs`)
        .then((response) => response.json())
        .then((result) => {
          console.log('Graphs fetched:', result);
          setGraphs(result);

          if (result.length > 0) {
            const firstGraph = result[0];
            console.log('First graph found:', firstGraph);
            setSelectedGraph(firstGraph);

            return fetchGraphDetails(firstGraph.id);
          } else {
            console.warn('No graphs available.');
          }
        })
        .catch((error) => console.error('Error fetching graphs:', error));
    };

    fetchSeedGroups()
      .then((defaultGroup) => {
        if (!defaultGroup) {
          console.warn('No default seed group available, skipping seed fetch.');
          throw new Error('No default group found');
        }

        return fetchGraphs().then((firstVariant) => {
          console.log('Graphs and variants processed.');
          return {defaultGroup, firstVariant};
        });
      })
      .then(({defaultGroup, firstVariant}) => {
        if (firstVariant && defaultGroup) {
          console.log(
            'Fetching seeds with:',
            `Graph Key: ${firstVariant.key.split('@')[0]}`,
            `Variant Name: ${firstVariant.key.split('@')[1]}`,
            `Group ID: ${defaultGroup.id}`
          );

          fetchSeeds(
            firstVariant.key.split('@')[0],
            firstVariant.key.split('@')[1],
            defaultGroup.id
          );
        } else {
          console.warn('Could not fetch seeds: missing variant or group.');
        }
      })
      .catch((error) =>
        console.error('Error during data fetching or processing:', error)
      );
  }, []);

  useEffect(() => {
    if (selectedSeedGroup && selectedVariant && selectedGraph) {
      console.log('selectedSeedGroup', selectedSeedGroup);
      const [graphId, variantName] = selectedVariant.key.split('@');
      fetchSeeds(graphId, variantName, selectedSeedGroup.id);
    }
  }, [selectedSeedGroup, selectedVariant, selectedGraph]);

  const customFetcher: HandleRequest = useCallback(
    async (endpointUrl, requestOptions) => {
      console.log('Fetching with custom fetcher');

      const result = await fetch(endpointUrl, requestOptions);
      const responseBody = await result.json();
      const requestBody = JSON.parse(requestOptions.body?.toString()!);

      const isIntrospectionQuery =
        requestBody.operationName === 'IntrospectionQuery';
      const isSuccess = result.ok && !responseBody.errors;

      // Only update state if it's not an introspection query and the fetch was successful
      if (!isIntrospectionQuery && isSuccess) {
        setSeedResponse(responseBody); // Only set the response when needed
        setIsSeedButtonVisible(true); // Trigger visibility only for non-introspection queries
        setSeedArgs(requestBody.variables); // Update variables only if needed
        setOperationName(requestBody.operationName); // Track the operation name only when necessary
      }

      return new Response(JSON.stringify(responseBody), {
        status: result.status,
        statusText: result.statusText,
        headers: result.headers,
      });
    },
    [setSeedResponse, setIsSeedButtonVisible, setSeedArgs, setOperationName]
  );

  const handleGraphChange = async (graphId) => {
    const selectedGraph = graphs.find((g) => g.id === graphId) || null;
    setSelectedGraph(selectedGraph);

    try {
      const response = await fetch(`${serverBaseUrl}/api/graphs/${graphId}`);
      const result = await response.json();

      setVariants(result.variants || []);
      setProposals(result.proposals || []);

      // Automatically select the first variant for the new graph
      if (result.variants && result.variants.length > 0) {
        setSelectedVariant(result.variants[0]);
      }
    } catch (error) {
      console.error('Error fetching graph details:', error);
      setVariants([]);
      setProposals([]);
    }
  };

  const fetchSeeds = (graphId, variantName, seedGroupId) => {
    console.log('fetching seeds');
    getSeeds(graphId, variantName, seedGroupId)
      .then((seeds) => {
        setSeeds(seeds);
      })
      .catch((e) => {
        console.error('Error fetching seeds: ', e);
        setSeeds([]);
      });
  };

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    console.log('Selected variant is:', variant);

    const [graphId, variantName] = variant.key.split('@');
    fetchSeeds(graphId, variantName, selectedSeedGroup.id);
  };

  const jsonValidator = z.string().refine(
    (value) => {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    },
    {
      message: 'Invalid JSON',
    }
  );

  const nonEmptyStringValidator = z
    .string()
    .refine((value) => value.trim().length > 0, {
      message: 'This field cannot be empty or consist only of whitespace',
    });

  const formSchema = z.object({
    operationName: nonEmptyStringValidator,
    operationMatchArguments: jsonValidator,
    seedResponse: jsonValidator,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operationMatchArguments: '{}',
    },
  });

  const {setValue} = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const [graphId, variantName] = selectedVariant.key.split('@');
      const normalizedValues = {
        ...values,
        variantName,
        seedGroupId: selectedSeedGroup.id,
        graphId,
        operationMatchArguments: JSON.parse(values.operationMatchArguments),
        seedResponse: JSON.parse(values.seedResponse),
      };

      const response: Response = await fetch(
        `${serverBaseUrl}/api/seeds?variantName=${variantName}&graphId=${graphId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(normalizedValues),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        toast({
          variant: 'destructive',
          title: 'Error Creating Seed',
          description:
            'An unexpected error occurred while creating the seed. Please try again.',
        });
      } else {
        toast({
          title: 'Seed Created Successfully!',
          description: 'Your new seed has been created and is ready for use.',
        });
        form.reset({
          operationName: '', // Optionally set specific values
          operationMatchArguments: '{}', // Set to the initial default value
          seedResponse: '',
        });
        fetchSeeds(graphId, variantName, selectedSeedGroup.id);
      }
    } catch (error) {
      toast({
        title: 'Error Creating Seed',
        description:
          'An unexpected error occurred while creating the seed. Please try again.',
      });
    }
  }

  const addSeedGroup = async (newGroupName) => {
    if (!newGroupName.trim()) return;
    try {
      const response = await fetch(`${serverBaseUrl}/api/seedGroups`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: newGroupName}),
      });

      if (response.ok) {
        const newGroup = await response.json();
        setSeedGroups([...seedGroups, newGroup]);
        setSelectedSeedGroup(newGroup);
        setDialogOpen(false);
        setNewGroupName('');
        toast({title: 'New seed group added successfully!'});
      } else {
        toast({variant: 'destructive', title: 'Failed to add seed group.'});
      }
    } catch (error) {
      console.error('Error creating new seed group:', error);
      toast({variant: 'destructive', title: 'Error adding new seed group.'});
    }
  };

  async function deleteSeed(seed: Seed) {
    try {
      const response = await fetch(`${serverBaseUrl}/api/seeds/${seed.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete seed with ID ${seed.id}`);
      }

      const result = await response.json();
      console.log(`Seed with ID ${seed.id} deleted successfully`, result);

      return result; // Assuming the API returns the deleted seed or a confirmation message
    } catch (error) {
      console.error('Error deleting seed:', error);
      throw error; // Re-throw the error to handle it elsewhere if needed
    }
  }

  async function populateSeedForm() {
    console.log('gonna populate the form');
    setValue('operationName', operationName);

    const hasVariables = seedArgs && Object.keys(seedArgs).length > 0;
    if (hasVariables) {
      setValue('operationMatchArguments', JSON.stringify(seedArgs, null, 2));
      setSeedWithArguments(true);
    }

    setValue('seedResponse', JSON.stringify(seedResponse, null, 2));
  }

  //TODO: implemenmt
  // const handleDelete = async () => {
  //   try {
  //     // const [graphId, variantName] = selectedVariant.key.split('@');
  //     // await deleteSeed(seed);
  //     // toast({
  //     //   title: 'Seed Deleted',
  //     //   description: 'The selected seed has been successfully removed.',
  //     // });
  //     // fetchSeeds(graphId, variantName, selectedSeedGroup.id);
  //     console.log('deleting seeed lalalalalalala');
  //     setIsDeleteDialogOpen(false);
  //     setSelectedSeed(null);
  //   } catch (error) {
  //     console.error('Failed to delete seed:', error);
  //   }
  // };

  const handleDeleteClick = (seed: Seed) => {
    setSelectedSeed(seed);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Tabs defaultValue="sandbox" className="w-full">
      <Toaster />
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between px-4 py-2 md:px-6">
          <div className="flex items-center gap-4 justify-start">
            <img
              src={logo}
              alt="Logo"
              className="h-14 w-24 object-cover cursor-pointer"
              onClick={handleLogoClick}
            />
            <TabsList className="w-max h-auto p-0 pl-4 bg-transparent border-0 gap-8">
              <TabsTrigger
                value="sandbox"
                className="px-0 pb-2 pt-0 text-lg font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none bg-transparent"
              >
                SANDBOX
              </TabsTrigger>
              <TabsTrigger
                value="seeds"
                className="px-0 pb-2 pt-0 text-lg font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none bg-transparent"
              >
                SEEDS
              </TabsTrigger>
              <TabsTrigger
                value="narratives"
                className="px-0 pb-2 pt-0 text-lg font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none bg-transparent"
              >
                NARRATIVES
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex items-center gap-4">
            <Settings
              className="h-5 w-5 text-gray-500 cursor-pointer"
              onClick={handleSettingsClick}
            />
            <User className="h-5 w-5 text-gray-500" />
          </div>
        </div>
        <div className="flex items-center gap-4 px-4 py-2 bg-white border-t">
          <Label htmlFor="graph-select">Graph</Label>
          <Select
            onValueChange={handleGraphChange}
            value={selectedGraph?.id || ''}
          >
            <SelectTrigger className="w-[200px]" id="graph-select">
              <SelectValue placeholder="Select a graph">
                {selectedGraph?.name || 'Select a graph'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {graphs.map((graph) => (
                <SelectItem key={graph.id} value={graph.id}>
                  {graph.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label htmlFor="variant-select">Variant</Label>
          <Select
            onValueChange={(value) => handleVariantChange(value)}
            value={selectedVariant?.displayName || ''}
            disabled={!selectedGraph}
          >
            <SelectTrigger className="w-[200px]" id="variant-select">
              <SelectValue placeholder="Select a variant">
                {selectedVariant?.displayName || 'Select a variant'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Variants</SelectLabel>
                {variants.map((variant) => (
                  <SelectItem key={variant.id} value={variant}>
                    {variant.displayName}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Proposals</SelectLabel>
                {proposals.map((proposal) => (
                  <SelectItem key={proposal.id} value={proposal}>
                    {proposal.displayName}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </header>

      <TabsContent
        value="sandbox"
        className="w-full h-[calc(100vh-64px)] relative"
        id="hey-hey-hey"
        style={{
          marginTop: '-72px',
          paddingTop: '24px',
          zIndex: 1,
        }}
      >
        <ApolloSandbox
          key={selectedGraph?.id + selectedVariant?.key + selectedSeedGroup?.id}
          endpointIsEditable={true}
          handleRequest={customFetcher}
          initialState={{
            sharedHeaders: {
              'seed-group': selectedSeedGroup?.id.toString(),
            },
          }}
          initialEndpoint={
            selectedGraph && selectedVariant
              ? `${serverBaseUrl}/api/${selectedVariant.key.replace('@', '/')}/graphql`
              : 'http://an-error-occurred'
          }
          className="w-full h-full"
        />
        {isSeedButtonVisible && (
          <Button
            onClick={populateSeedForm}
            className="absolute"
            style={{right: '176px', top: '115px'}}
          >
            Create seed
          </Button>
        )}
      </TabsContent>
      <TabsContent
        value="seeds"
        className="w-full h-[calc(100vh-64px)] relative"
      >
        <div className="flex flex-col h-full">
          <div className="w-full p-6 bg-background">
            <div className="flex items-center space-x-4">
              <Label htmlFor="seed-group-select">Seed Group</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild id="seed-group-select">
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[250px] justify-between"
                  >
                    {selectedSeedGroup
                      ? selectedSeedGroup.name
                      : 'Select seed group...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0">
                  <Command>
                    <CommandInput placeholder="Search seed group..." />
                    <CommandList>
                      <CommandEmpty>No seed group found.</CommandEmpty>
                      <CommandGroup heading="Seed Groups">
                        {seedGroups.map((g) => (
                          <CommandItem
                            key={g.id}
                            value={g.name}
                            onSelect={(seedGroupName) => {
                              const selectedGroup = seedGroups.find(
                                (g) => g.name === seedGroupName
                              );
                              if (selectedGroup) {
                                console.log(
                                  '[seeds-tab.tsx] Selected group:',
                                  selectedGroup
                                );
                                setSelectedSeedGroup(selectedGroup);
                              } else {
                                console.warn(
                                  'Group not found for value:',
                                  seedGroupName
                                );
                              }
                              setOpen(false);
                            }}
                          >
                            {g.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => {
                            setDialogOpen(true);
                            setOpen(false);
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add new seed group
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Create new seed</CardTitle>
                <CardDescription>
                  <div>
                    1. Use the embedded Apollo Sandbox to generate a dummy
                    response for the operation you want to mock.
                  </div>
                  <div>
                    2. Paste the dummy response in here and adjust it to fit
                    your specific needs.
                  </div>
                  <div>
                    3. If your operation contains arguments, please define them.
                    The operation will only match against these specified
                    arguments.
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="operationName"
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>Operation name</FormLabel>
                          <FormControl>
                            <Input placeholder="Operation name..." {...field} />
                          </FormControl>
                          <FormDescription>
                            Name of the GraphQL operation that will be sent to
                            the mock
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormItem>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="seed-with-arguments"
                            checked={seedWithArguments}
                            onCheckedChange={() =>
                              setSeedWithArguments(!seedWithArguments)
                            }
                          />
                          <Label htmlFor="seed-with-arguments">
                            Seed with arguments
                          </Label>
                        </div>
                      </FormControl>
                    </FormItem>
                    <FormField
                      control={form.control}
                      name="operationMatchArguments"
                      render={({field}) => (
                        <FormItem
                          className={`transition-all duration-500 ease-in-out ${
                            seedWithArguments
                              ? 'max-h-[500px] opacity-100 visible'
                              : 'max-h-0 opacity-0 invisible'
                          }`}
                        >
                          <FormLabel>Matching arguments (JSON)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Matching arguments ..."
                              {...field}
                              className="h-48"
                            />
                          </FormControl>
                          <FormDescription>
                            Parameters used for matching a seed with GraphQL
                            operations.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="seedResponse"
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>Response (JSON)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Response..."
                              {...field}
                              className="h-48"
                            />
                          </FormControl>
                          <FormDescription>
                            Data to be returned for the combination of the
                            defined operation name, seed group id and parameters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex space-x-2">
                      <Button type="button" variant="secondary">
                        Discard
                      </Button>
                      <Button type="submit">Save seed</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="narratives"
        className="w-full h-[calc(100vh-64px)] relative"
      >
        {/* Add content for Narratives tab */}
      </TabsContent>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Seed Group</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => addSeedGroup(newGroupName)}>
              Add Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
};

export default Home;
