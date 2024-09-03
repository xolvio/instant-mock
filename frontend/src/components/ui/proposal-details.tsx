import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';
import React, {useEffect, useState} from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './dropdown-menu';
import {Button} from './button';
import {MoreHorizontal, Link} from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import {Input} from './input';
import {z} from 'zod';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';
import {Toaster} from './toaster';
import {useToast} from './use-toast';
import {Textarea} from './textarea';
import {useNavigate, useParams} from 'react-router';
import {Seed} from '@/models/Seed';
import {HoverCard, HoverCardContent, HoverCardTrigger} from './hover-card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from './breadcrumb';

import {Link as RouterLink} from 'react-router-dom';
import {Switch} from './switch';
import {Label} from './label';
import {createGraphiQLFetcher} from '@graphiql/toolkit';
import {GraphiQL} from 'graphiql';
// import 'graphiql/graphiql.css';
// import '../../graphiql.css';
import {ApolloExplorer} from '@apollo/explorer/react';
import {ApolloExplorerReact} from '@apollo/explorer/src/react/ApolloExplorer';
import {ApolloSandbox} from '@apollo/sandbox/react';
import {HandleRequest} from '@apollo/sandbox/src/helpers/postMessageRelayHelpers';

const ProposalDetails = () => {
  const port = process.env.PORT || 3001;
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const {toast} = useToast();
  const {proposalId} = useParams();
  // State to manage dialog open state
  const [seeds, setSeeds] = useState<Seed[]>([]); // Use Seed type for state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [seedWithArguments, setSeedWithArguments] = useState(false);
  const [selectedSeedId, setSelectedSeedId] = useState(-1);
  // Fetch seeds
  useEffect(() => {
    fetchSeeds();
  }, [proposalId]);

  // const customFetcher = async (graphQLParams: any, headers: any) => {
  //   const {query, variables, operationName} = graphQLParams;
  //   // Merge custom headers with headers from GraphiQL
  //   console.log(headers);
  //   const mergedHeaders = {
  //     'Content-Type': 'application/json',
  //     ...headers.headers, // Include headers from GraphiQL
  //   };
  //   const response = await fetch(`${apiUrl}/${proposalId}/graphql`, {
  //     method: 'POST',
  //     headers: mergedHeaders,
  //     body: JSON.stringify(graphQLParams),
  //   });
  //
  //   const result = await response.json();
  //   const isIntrospectionQuery = query.includes('IntrospectionQuery');
  //
  //   // Only set the seedResponse if it's not an introspection query
  //   if (!isIntrospectionQuery) {
  //     setValue('seedResponse', JSON.stringify(result, null, 2));
  //     setValue('operationName', operationName);
  //   }
  //
  //   // Check if variables is not an empty object
  //   const hasVariables = variables && Object.keys(variables).length > 0;
  //
  //   if (hasVariables) {
  //     setValue('operationMatchArguments', JSON.stringify(variables, null, 2));
  //     setSeedWithArguments(true);
  //   }
  //
  //   return result;
  // };

  async function populateModal(requestBody: any, responseBody: any) {
    setValue('operationName', requestBody.operationName);

    const hasVariables = requestBody.variables && Object.keys(requestBody.variables).length > 0;
    if (hasVariables) {
      setValue('operationMatchArguments', JSON.stringify(requestBody.variables, null, 2));
      setSeedWithArguments(true);
    }

    const response = await responseBody.clone().json();
    setValue('seedResponse', JSON.stringify(response, null, 2));
  }

  const customFetcher: HandleRequest = async (endpointUrl, requestOptions) => {
    const result = await fetch(endpointUrl, requestOptions);
    const requestBody = JSON.parse(requestOptions.body?.toString()!);
    const isIntrospectionQuery = requestBody.operationName === 'IntrospectionQuery';
    if (!isIntrospectionQuery) {
      populateModal(requestBody, result);
    }
    return result;
  };

  const fetchSeeds = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/api/seeds?variantName=${proposalId}`
      );
      const seeds: Seed[] = await response.json();
      setSeeds(seeds);
    } catch (error) {
      console.error('Error fetching seeds:', error);
    }
  };

  const defaultHeaders =
    '{\n' + '  "mocking-sequence-id": "your-mocking-sequence-id"\n' + '}';

  // Define a custom validation for JSON strings
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
    sequenceId: nonEmptyStringValidator,
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

  async function deleteSeed(seedId: number) {
    try {
      const response = await fetch(`${apiUrl}/api/seeds/${seedId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete seed with ID ${seedId}`);
      }

      const result = await response.json();
      console.log(`Seed with ID ${seedId} deleted successfully`, result);

      return result; // Assuming the API returns the deleted seed or a confirmation message
    } catch (error) {
      console.error('Error deleting seed:', error);
      throw error; // Re-throw the error to handle it elsewhere if needed
    }
  }

  const handleDelete = async (seedId: number) => {
    try {
      const result = await deleteSeed(seedId);
      fetchSeeds();
      console.log('Deleted seed:', result);
      // Optionally, update the state to remove the seed from your UI
    } catch (error) {
      console.error('Failed to delete seed:', error);
    }
  };

  const handleDeleteClick = (seedId: number) => {
    setSelectedSeedId(seedId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    handleDelete(selectedSeedId); // Call your delete function here
    setIsDeleteDialogOpen(false);
  };

  function getCurrentDateTime(): string {
    const now = new Date();

    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

    return `${dateFormatter.format(now)} at ${timeFormatter.format(now)}`;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const normalizedValues = {
        ...values,
        operationMatchArguments: JSON.parse(values.operationMatchArguments),
        seedResponse: JSON.parse(values.seedResponse),
      };
      const response: Response = await fetch(
        `${apiUrl}/api/seeds?variantName=${proposalId}`,
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
          title: 'There was an error creating the seed!',
          description: getCurrentDateTime(),
        });
      } else {
        toast({
          title: 'Seed created successfully!',
          description: getCurrentDateTime(),
        });
        fetchSeeds();
        // Close the dialog on successful form submission
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'There was an error creating the seed!',
        description: getCurrentDateTime(),
      });
    }
  }

  return (
      <>
        <div className="sandbox-container">
          <ApolloSandbox
              initialEndpoint={`${apiUrl}/${proposalId}/graphql`}
              className="apollo-sandbox"
          />
        </div>
        <div className="flex justify-center items-start p-4 bg-muted/40">
          <div className="w-full max-w-4xl space-y-4">
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <RouterLink to="/">Proposals Dashboard</RouterLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator/>
                <BreadcrumbItem>Proposal Details</BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Card x-chunk="dashboard-07-chunk-5" className="mb-4">
              <CardHeader>
                <CardTitle>Proposal details</CardTitle>
                <CardDescription>
                  {/*TODO real description*/}
                  <span>
                  US-O2-375 : MNV: Make paymentDetails field an array instead of
                  a single object
                </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-2">
                  <a
                      href={`https://studio.apollographql.com/sandbox/explorer?endpoint=${apiUrl}/${proposalId}/graphql`}
                      className="underline ml-1"
                      target="_blank"
                      rel="noopener noreferrer"
                  >
                    Explore schema in Apollo Studio
                  </a>
                </div>
                <div className="flex items-center mb-2">
                  <Link
                      to={`${apiUrl}/${proposalId}/graphql`}
                      className="mr-1.5 h-4 w-4 underline"
                  >
                    <span className="mr-1.5 h-4 w-4"></span>{' '}
                    {/* Icon placeholder if needed */}
                  </Link>
                  <span>{`Server URL: ${apiUrl}/${proposalId}/graphql`}</span>
                </div>
              </CardContent>
            </Card>
            <Card
                x-chunk="dashboard-06-chunk-0"
                className="xl:col-span-2 flex flex-col min-h-[300px]"
            >
              {' '}
              {/* Added margin-bottom */}
              <CardHeader className="flex flex-row items-center">
                <div>
                  <CardTitle>Seeds</CardTitle>
                  <CardDescription>Manage your seeds.</CardDescription>
                </div>
                <Dialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                        className="ml-auto gap-1"
                        onClick={() => setIsCreateDialogOpen(true)}
                    >
                      Create seed
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create new seed</DialogTitle>
                      <DialogDescription>
                        <div>
                          1. Go to Apollo Studio or use the embedded GraphiQL to
                          generate a dummy response for the operation you want to
                          mock.
                        </div>
                        <div>
                          2. Paste the dummy response in here and adjust it to fit
                          your specific needs.
                        </div>
                        <div>
                          3. If your operation contains arguments, please define
                          them. The operation will only match against these
                          specified arguments.
                        </div>
                        <div>4. Define sequence ID.</div>
                      </DialogDescription>
                    </DialogHeader>
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
                                    <Input
                                        placeholder="Operation name..."
                                        {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Name of the GraphQL operation that will be sent to
                                    the mock
                                  </FormDescription>
                                  <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="sequenceId"
                            render={({field}) => (
                                <FormItem>
                                  <FormLabel>Sequence id</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Sequence id..." {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    A unique string used to match GraphQL requests
                                    with registered seed. This id must be included in
                                    the request as 'mocking-sequence-id' header.
                                  </FormDescription>
                                  <FormMessage/>
                                </FormItem>
                            )}
                        />

                        {/* Switch to control the visibility of operationMatchArguments */}
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
                                  <FormMessage/>
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
                                    defined operation name, sequence id and parameters
                                  </FormDescription>
                                  <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <div className="sm:justify-start flex space-x-2">
                          <DialogClose asChild>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsCreateDialogOpen(false)}
                            >
                              Discard
                            </Button>
                          </DialogClose>
                          <Button type="submit">Save seed</Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              {seeds.length === 0 && (
                  <div className="flex flex-col items-center gap-1 text-center">
                    {/*<Bean className="text-gray-500 h-16 w-16"></Bean>*/}
                    <h3 className="text-2xl font-bold tracking-tight">
                      You have no seeds
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Please create some seeds for this schema proposal.
                    </p>
                  </div>
              )}
              {seeds.length > 0 && (
                  <>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Operation name</TableHead>
                            <TableHead>Sequence ID</TableHead>
                            <TableHead className="hidden md:table-cell">
                              Matching arguments
                            </TableHead>
                            <TableHead className="hidden md:table-cell">
                              Response
                            </TableHead>
                            <TableHead>
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
                                <TableCell>{seed.sequenceId}</TableCell>
                                <TableCell className="hidden md:table-cell">
                                  <HoverCard>
                                    <HoverCardTrigger>
                                      Hover to see arguments
                                    </HoverCardTrigger>
                                    <HoverCardContent className="p-0">
                                <pre className="bg-gray-100 p-4 rounded overflow-auto">
                                  <code className="text-sm overflow-auto">
                                    {JSON.stringify(
                                        JSON.parse(seed.operationMatchArguments),
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
                                    <HoverCardTrigger>
                                      Hover to see arguments
                                    </HoverCardTrigger>
                                    <HoverCardContent className="p-0">
                                <pre className="bg-gray-100 p-4 rounded overflow-auto">
                                  <code className="text-sm overflow-auto">
                                    {JSON.stringify(
                                        JSON.parse(seed.seedResponse),
                                        null,
                                        2
                                    )}
                                  </code>
                                </pre>
                                    </HoverCardContent>
                                  </HoverCard>
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                          aria-haspopup="true"
                                          size="icon"
                                          variant="ghost"
                                      >
                                        <MoreHorizontal className="h-4 w-4"/>
                                        <span className="sr-only">Toggle menu</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem
                                          onClick={() =>
                                              navigate(
                                                  `/proposals/${proposalId}/seeds/${seed.id}`
                                              )
                                          }
                                      >
                                        View
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                          onClick={() => handleDeleteClick(seed.id)}
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
                    </CardContent>
                  </>
              )}
            </Card>
            <Toaster/>
            <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this seed? This action cannot
                    be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Cancel</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={handleConfirmDelete}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </>
  );
};

export default ProposalDetails;
