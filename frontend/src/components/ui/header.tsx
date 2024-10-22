import {
  Check,
  ChevronsUpDown,
  CircleUser,
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
    setOpen(false);
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
                          setValue(currentValue === value ? '' : currentValue);
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
                <Button type="submit" onClick={() => addNewGroup(newGroupName)}>
                  Add Group
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add New Seed Group */}
          <div className="flex items-center gap-2">
            <Input
              className="w-[150px]"
              placeholder="New seed group"
              value={newSeedGroup}
              onChange={(e) => setNewSeedGroup(e.target.value)}
            />
            <Button size="sm" onClick={handleAddSeedGroup}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Settings
            className="h-5 w-5 text-gray-500"
            onClick={handleSettingsClick}
          />
          <User className="h-5 w-5 text-gray-500" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
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

      {/* Dashboard Selector Tab Group */}
      <div className="flex space-x-2">
        <Button
          variant={activeTab === 'sandbox' ? 'default' : 'outline'}
          onClick={() => setActiveTab('sandbox')}
        >
          Sandbox
        </Button>
        <Button
          variant={activeTab === 'seeds' ? 'default' : 'outline'}
          onClick={() => setActiveTab('seeds')}
        >
          Seeds
        </Button>
        <Button
          variant={activeTab === 'narratives' ? 'default' : 'outline'}
          onClick={() => setActiveTab('narratives')}
        >
          Narratives
        </Button>
      </div>
    </header>
  );
};

export default Header;
