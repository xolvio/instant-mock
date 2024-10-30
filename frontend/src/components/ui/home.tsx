import {Seed} from '@/models/Seed';
import {ApolloSandbox} from '@apollo/sandbox/react';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  ChevronsUpDown,
  MoreHorizontal,
  Plus,
  Settings,
  User,
} from 'lucide-react';
import React, {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {useNavigate} from 'react-router';
import {z} from 'zod';
import logo from '../../assets/logo.png';
import {getSeeds} from '../../services/SeedService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './dropdown-menu';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';
import {HoverCard, HoverCardContent, HoverCardTrigger} from './hover-card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
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
    <>
      <Toaster />
      <header className="sticky top-0 z-50 flex items-center justify-between border-b bg-background px-4 py-2 md:px-6">
        <img
          src={logo}
          alt="Logo"
          className="h-14 w-24 object-cover cursor-pointer"
          onClick={handleLogoClick}
        />
        <div className="flex items-center gap-4">
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

          <div>Variant</div>
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
                              '[home.tsx:446] Selected group:',
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

          <Settings
            className="h-5 w-5 text-gray-500 cursor-pointer"
            onClick={handleSettingsClick}
          />
          <User className="h-5 w-5 text-gray-500" />
          {/*<DropdownMenu>*/}
          {/*  <DropdownMenuTrigger asChild>*/}
          {/*    <Button variant="secondary" size="icon" className="rounded-full">*/}
          {/*      <CircleUser className="h-5 w-5" />*/}
          {/*      <span className="sr-only">Toggle user menu</span>*/}
          {/*    </Button>*/}
          {/*  </DropdownMenuTrigger>*/}
          {/*  <DropdownMenuContent align="end">*/}
          {/*    <DropdownMenuLabel>My Account</DropdownMenuLabel>*/}
          {/*    <DropdownMenuSeparator />*/}
          {/*    <DropdownMenuItem onClick={handleSettingsClick}>*/}
          {/*      Settings*/}
          {/*    </DropdownMenuItem>*/}
          {/*    <DropdownMenuItem>Support</DropdownMenuItem>*/}
          {/*    <DropdownMenuSeparator />*/}
          {/*    <DropdownMenuItem>Logout</DropdownMenuItem>*/}
          {/*  </DropdownMenuContent>*/}
          {/*</DropdownMenu>*/}
        </div>

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
      </header>
      <Tabs defaultValue="sandbox" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
          <TabsTrigger value="seeds">Seeds</TabsTrigger>
          <TabsTrigger value="narratives">Narratives</TabsTrigger>
        </TabsList>
        <TabsContent
          value="sandbox"
          className="w-full h-[calc(100vh-64px)] relative"
        >
          <ApolloSandbox
            key={
              selectedGraph?.id + selectedVariant?.key + selectedSeedGroup?.id
            }
            endpointIsEditable={false}
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
            <Button className="absolute top-28 right-64 z-10">
              Create seed
            </Button>
          )}
        </TabsContent>
        <TabsContent value="seeds" className="space-y-4 p-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>Seeds</CardTitle>
                  <CardDescription>Manage your seeds.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedGraph || !selectedVariant ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <h3 className="text-lg font-semibold">
                      Please select both a graph and a variant or proposal
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      You need to select both a graph and variant to view
                      available seeds.
                    </p>
                  </div>
                ) : seeds.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <h3 className="text-lg font-semibold">You have no seeds</h3>
                    <p className="text-sm text-muted-foreground">
                      Please create some seeds for this schema proposal.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Operation name</TableHead>
                        {/*TODO probably not needed*/}
                        <TableHead>Seed group id</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Arguments
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Response
                        </TableHead>
                        <TableHead className="w-[80px]">
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {seeds.map((seed) => (
                        <TableRow key={seed.operationName}>
                          <TableCell className="font-medium">
                            {seed.operationName}
                          </TableCell>
                          <TableCell>{selectedSeedGroup.id}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <HoverCard>
                              <HoverCardTrigger className="cursor-pointer underline">
                                View arguments
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80">
                                <pre className="max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
                                  <code>
                                    {JSON.stringify(
                                      seed.operationMatchArguments,
                                      null,
                                      2
                                    )}
                                  </code>
                                </pre>
                              </HoverCardContent>
                            </HoverCard>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <HoverCard>
                              <HoverCardTrigger className="cursor-pointer underline">
                                View response
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80">
                                <pre className="max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
                                  <code>
                                    {JSON.stringify(seed.seedResponse, null, 2)}
                                  </code>
                                </pre>
                              </HoverCardContent>
                            </HoverCard>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => navigate(`/seeds/${seed.id}`)}
                                >
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(seed)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
              <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
              >
                {/*<AlertDialogTrigger asChild>*/}
                {/*  <Button variant="destructive">Delete Seed</Button>*/}
                {/*</AlertDialogTrigger>*/}
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this seed? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Card>

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
        </TabsContent>
        <TabsContent value="narratives">
          {/* Add content for Narratives tab */}
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Home;
