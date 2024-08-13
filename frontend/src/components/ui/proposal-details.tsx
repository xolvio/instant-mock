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
import 'graphiql/graphiql.css';
import '../../graphiql.css';

const ProposalDetails = () => {
  const port = process.env.PORT || 3001;
  const navigate = useNavigate();
  const {toast} = useToast();
  const {proposalId} = useParams();
  // State to manage dialog open state
  const [seeds, setSeeds] = useState<Seed[]>([]); // Use Seed type for state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [seedWithArguments, setSeedWithArguments] = useState(false);
  // Fetch seeds
  useEffect(() => {
    fetchSeeds();
  }, [proposalId]);

  const fetcher = createGraphiQLFetcher({
    url: `http://localhost:${port}/${proposalId}/graphql`,
  });

  const fetchSeeds = async () => {
    try {
      const response = await fetch(
        `http://localhost:${port}/api/seeds?variantName=${proposalId}`
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

  async function deleteSeed(seedId: number) {
    try {
      const response = await fetch(
        `http://localhost:3001/api/seeds/${seedId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const normalizedValues = {
        ...values,
        operationMatchArguments: JSON.parse(values.operationMatchArguments),
        seedResponse: JSON.parse(values.seedResponse),
      };
      const response = await fetch(
        `http://localhost:${port}/api/seeds?variantName=${proposalId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(normalizedValues),
        }
      );
      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'There was an error creating the seed!',
          description: 'Friday, February 10, 2023 at 5:57 PM',
        });
      } else {
        toast({
          title: 'Seed created successfully!',
          description: 'Friday, February 10, 2023 at 5:57 PM',
        });
        fetchSeeds();
        // Close the dialog on successful form submission
        setIsDialogOpen(false);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'There was an error creating the seed!',
        description: 'Friday, February 10, 2023 at 5:57 PM',
      });
    }
  }

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
            <BreadcrumbItem>Proposal Details</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Card x-chunk="dashboard-07-chunk-5" className="mb-4">
          <CardHeader>
            <CardTitle>Proposal details</CardTitle>
            <CardDescription>
              {/*TODO real description*/}
              <span>
                US-O2-375 : MNV: Make paymentDetails field an array instead of a
                single object
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-2">
              <a
                href={`https://studio.apollographql.com/sandbox/explorer?endpoint=http://localhost:${port}/${proposalId}/graphql`}
                className="underline ml-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                Explore schema in Apollo Studio
              </a>
            </div>
            <div className="flex items-center mb-2">
              <Link
                to={`http://localhost:${port}/${proposalId}/graphql`}
                className="mr-1.5 h-4 w-4 underline"
              >
                <span className="mr-1.5 h-4 w-4"></span>{' '}
                {/* Icon placeholder if needed */}
              </Link>
              <span>{`Server URL: http://localhost:${port}/${proposalId}/graphql`}</span>
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="ml-auto gap-1"
                  onClick={() => setIsDialogOpen(true)}
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
                            A unique string used to match GraphQL requests with
                            registered seed. This id must be included in the
                            request as 'mocking-sequence-id' header.
                          </FormDescription>
                          <FormMessage />
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
                            defined operation name, sequence id and parameters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="sm:justify-start flex space-x-2">
                      <DialogClose asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setIsDialogOpen(false)}
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
                            <HoverCardContent>
                              <pre
                                className="bg-gray-100 p-4 rounded overflow-auto"
                                style={{
                                  whiteSpace: 'pre-wrap',
                                  wordWrap: 'break-word',
                                }}
                              >
                                <code className="text-sm">
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
                            <HoverCardTrigger>
                              Hover to see response
                            </HoverCardTrigger>
                            <HoverCardContent>
                              <pre
                                className="bg-gray-100 p-4 rounded overflow-auto"
                                style={{
                                  whiteSpace: 'pre-wrap',
                                  wordWrap: 'break-word',
                                }}
                              >
                                <code className="text-sm">
                                  {JSON.stringify(seed.seedResponse, null, 2)}
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
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(
                                    `/proposals/${proposalId}/seeds/${seed.id}`,
                                    {
                                      state: {
                                        operationName: seed.operationName,
                                        sequenceId: seed.sequenceId,
                                        operationMatchArguments:
                                          seed.operationMatchArguments,
                                        seedResponse: seed.seedResponse,
                                      },
                                    }
                                  )
                                }
                              >
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(seed.id)}
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
              <CardFooter>
                {/*<div className="text-xs text-muted-foreground">*/}
                {/*    Showing <strong>1-10</strong> of <strong>32</strong>{" "}*/}
                {/*    seeds*/}
                {/*</div>*/}
              </CardFooter>
            </>
          )}
        </Card>
        <Card x-chunk="dashboard-07-chunk-5" className="mb-4">
          <CardHeader>
            <CardTitle>Browse and query your schema</CardTitle>
            <CardDescription>
              <span>
                Use code editor to get the data shape for the operation you want
                to mock
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GraphiQL fetcher={fetcher} defaultHeaders={defaultHeaders}>
              <GraphiQL.Logo>Editor</GraphiQL.Logo>
            </GraphiQL>
          </CardContent>
        </Card>
        <Toaster />
      </div>
    </div>
  );
};

export default ProposalDetails;
