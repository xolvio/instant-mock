import {useState, useEffect} from 'react';
import {Button} from './button';
import {Input} from './input';
import {Settings, User, Plus} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@radix-ui/react-select';

type Graph = {
  id: string;
  name: string;
  variants: Variant[];
};

type Variant = {
  id: string;
  name: string;
};

type SeedGroup = {
  id: string;
  name: string;
};

type ComponentData = {
  graphs: Graph[];
  seedGroups: SeedGroup[];
  defaultSeedGroup: SeedGroup;
};

export default function DashboardSelector() {
  const [activeTab, setActiveTab] = useState('narratives');
  const [selectedGraph, setSelectedGraph] = useState<Graph | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedSeedGroup, setSelectedSeedGroup] = useState<SeedGroup | null>(
    null
  );
  const [newSeedGroup, setNewSeedGroup] = useState('');
  const [data, setData] = useState<ComponentData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data-endpoint'); // Replace with your API endpoint
        const result = await response.json();
        setData(result);
        setSelectedSeedGroup(result.defaultSeedGroup);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleGraphChange = (graphId: string) => {
    const graph = data?.graphs.find((g) => g.id === graphId) || null;
    setSelectedGraph(graph);
    setSelectedVariant(null);
  };

  const handleVariantChange = (variantId: string) => {
    const variant =
      selectedGraph?.variants.find((v) => v.id === variantId) || null;
    setSelectedVariant(variant);
  };

  const handleAddSeedGroup = () => {
    if (newSeedGroup) {
      const newGroup: SeedGroup = {
        id: Date.now().toString(),
        name: newSeedGroup,
      };
      data?.seedGroups.push(newGroup);
      setSelectedSeedGroup(newGroup);
      setNewSeedGroup('');
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Logo />
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
          <Select
            value={selectedSeedGroup?.id || ''}
            onValueChange={(value) =>
              setSelectedSeedGroup(
                data?.seedGroups.find((sg) => sg.id === value) || null
              )
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select seed group" />
            </SelectTrigger>
            <SelectContent>
              {data?.seedGroups.map((seedGroup) => (
                <SelectItem key={seedGroup.id} value={seedGroup.id}>
                  {seedGroup.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
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
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-gray-500" />
          <User className="h-5 w-5 text-gray-500" />
        </div>
      </div>
      <div className="mt-4 flex space-x-2">
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
}

function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-6 h-6 bg-emerald-500 rounded" />
      <span className="text-xl font-semibold text-gray-800">xolvio</span>
    </div>
  );
}
