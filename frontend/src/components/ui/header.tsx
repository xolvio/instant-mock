import {CircleUser, Plus, Settings, User} from 'lucide-react';
import React from 'react';
import {useNavigate} from 'react-router';
import logo from '../../assets/logo.png';
import {Button} from './button';
import {Input} from './input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import {useState, useEffect} from 'react';

const Header = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sandbox');
  const [selectedGraph, setSelectedGraph] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [seedGroups, setSeedGroups] = useState([]);
  const [selectedSeedGroup, setSelectedSeedGroup] = useState(null);
  const [newSeedGroup, setNewSeedGroup] = useState('');
  const [data, setData] = useState(null);

  // Navigation handlers
  const handleSettingsClick = () => navigate('/settings');
  const handleLogoClick = () => navigate('/graphs');

  // Fetch data for the selects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data-endpoint');
        const result = await response.json();
        setData(result);
        setSeedGroups(result.seedGroups);
        setSelectedSeedGroup(result.defaultSeedGroup);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleGraphChange = (graphId) => {
    const graph = data?.graphs.find((g) => g.id === graphId) || null;
    setSelectedGraph(graph);
    setSelectedVariant(null); // Reset variant on graph change
  };

  const handleVariantChange = (variantId) => {
    const variant =
      selectedGraph?.variants.find((v) => v.id === variantId) || null;
    setSelectedVariant(variant);
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
              {data?.graphs.map((graph) => (
                <SelectItem key={graph.id} value={graph.id}>
                  {graph.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Variant Select */}
          <Select onValueChange={handleVariantChange} disabled={!selectedGraph}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Variant / Proposal" />
            </SelectTrigger>
            <SelectContent>
              {selectedGraph?.variants.map((variant) => (
                <SelectItem key={variant.id} value={variant.id}>
                  {variant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Seed Group Select */}
          <Select
            value={selectedSeedGroup?.id || ''}
            onValueChange={(value) =>
              setSelectedSeedGroup(
                seedGroups.find((sg) => sg.id === value) || null
              )
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select seed group" />
            </SelectTrigger>
            <SelectContent>
              {seedGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
