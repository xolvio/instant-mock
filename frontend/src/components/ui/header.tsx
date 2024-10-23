import {ApolloSandbox} from '@apollo/sandbox/react';
import {
  Check,
  ChevronsUpDown,
  CircleUser,
  MoreHorizontal,
  Plus,
  Settings,
  User,
} from 'lucide-react';
import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import logo from '../../assets/logo.png';
import {cn} from '../../lib/utils';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import {Tabs, TabsContent, TabsList, TabsTrigger} from './tabs';

const Header = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sandbox');
  const [selectedGraph, setSelectedGraph] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null); // Track selected variant
  const [variants, setVariants] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [seedGroups, setSeedGroups] = useState([]);
  const [selectedSeedGroup, setSelectedSeedGroup] = useState(null);
  const [newSeedGroup, setNewSeedGroup] = useState('');
  const [graphs, setGraphs] = useState([]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [groups, setGroups] = useState(seedGroups);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [newGroupName, setNewGroupName] = React.useState('');

  const addNewGroup = (newGroupName: string) => {
    const newGroup = {
      id: (groups.length + 1).toString(),
      name: newGroupName,
    };
    setGroups([...groups, newGroup]);
    setValue(newGroup.id);
    setDialogOpen(false);
  };

  // Navigation handlers
  const handleSettingsClick = () => navigate('/settings');
  const handleLogoClick = () => navigate('/graphs');

  // Fetch only graphs on component mount
  useEffect(() => {
    const fetchGraphs = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/graphs');
        const result = await response.json();
        setGraphs(result); // Only set graphs, ignoring variants
      } catch (error) {
        console.error('Error fetching graphs:', error);
      }
    };
    fetchGraphs();
  }, []);

  // Fetch variants and proposals for the selected graph
  const handleGraphChange = async (graphId) => {
    const selectedGraph = graphs.find((g) => g.id === graphId) || null;
    setSelectedGraph(selectedGraph);
    setSelectedVariant(null); // Clear variant when a new graph is selected

    try {
      const response = await fetch(
        `http://localhost:3001/api/graphs/${graphId}`
      );
      const result = await response.json();

      setVariants(result.variants || []);
      setProposals(result.proposals || []);
    } catch (error) {
      console.error('Error fetching graph details:', error);
      setVariants([]);
      setProposals([]);
    }
  };

  const handleVariantChange = (variantId) => {
    console.log(variantId);
    setSelectedVariant(variantId); // Set the selected variant
  };

  const handleAddSeedGroup = () => {
    if (newSeedGroup) {
      const newGroup = {id: Date.now().toString(), name: newSeedGroup};
      setSeedGroups([...seedGroups, newGroup]);
      setSelectedSeedGroup(newGroup);
      setNewSeedGroup('');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex flex-col gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex h-16 items-center gap-4">
          <img
            src={logo}
            alt="Logo"
            className="h-14 w-24 object-cover cursor-pointer"
            onClick={handleLogoClick}
          />
          <div className="flex items-center gap-4">
            {/* Graph Select */}
            <Select onValueChange={handleGraphChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a graph" />
              </SelectTrigger>
              <SelectContent>
                {graphs.map((graph) => (
                  <SelectItem key={graph.id} value={graph.id}>
                    {graph.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Variant/Proposal Select */}
            <Select
              value={selectedVariant || ''} // Ensure no variant is selected by default
              onValueChange={handleVariantChange}
              disabled={!selectedGraph}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Variant / Proposal" />
              </SelectTrigger>
              <SelectContent>
                {/* Variants Group */}
                <SelectGroup>
                  <SelectLabel>Variants</SelectLabel>
                  {variants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Proposals</SelectLabel>
                  {proposals.map((proposal) => (
                    <SelectItem key={proposal.id} value={proposal.id}>
                      {proposal.displayName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[250px] justify-between"
                >
                  {value
                    ? groups.find((group) => group.id === value)?.name
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
                      {groups.map((group) => (
                        <CommandItem
                          key={group.id}
                          value={group.id}
                          onSelect={(currentValue) => {
                            setValue(
                              currentValue === value ? '' : currentValue
                            );
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              value === group.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          {group.name}
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
                  <Button
                    type="submit"
                    onClick={() => addNewGroup(newGroupName)}
                  >
                    Add Group
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Settings
              className="h-5 w-5 text-gray-500"
              onClick={handleSettingsClick}
            />
            <User className="h-5 w-5 text-gray-500" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full"
                >
                  <CircleUser className="h-5 w-5" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSettingsClick}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <Tabs defaultValue="sandbox" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
          <TabsTrigger value="seeds">Seeds</TabsTrigger>
          <TabsTrigger value="narratives">Narratives</TabsTrigger>
        </TabsList>
        <TabsContent value="sandbox" className="w-full h-[calc(100vh-64px)]">
          <ApolloSandbox
            initialEndpoint="http://localhost:3000/graphql"
            className="w-full h-full"
          />
        </TabsContent>
        <TabsContent value="seeds" className="space-y-4 p-4">
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Seeds</CardTitle>
                <CardDescription>Manage your seeds.</CardDescription>
              </div>
              <Button
                className="ml-auto"
                size="sm"
                // onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create seed
              </Button>
            </CardHeader>
            <CardContent>
              {[].length === 0 ? (
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
                      <TableHead>Sequence ID</TableHead>
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
                    {[].map((seed) => (
                      <TableRow key={seed.operationName}>
                        <TableCell className="font-medium">
                          {seed.operationName}
                        </TableCell>
                        <TableCell>{seed.sequenceId}</TableCell>
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
                              <DropdownMenuItem>View</DropdownMenuItem>
                              <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="narratives">
          {/* Add content for Narratives tab */}
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Header;
