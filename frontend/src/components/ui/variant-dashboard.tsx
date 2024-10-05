import {Graph} from '@/models/Graph';
import {ListFilter, Search} from 'lucide-react';
import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router';
import {ProposalStatus} from '../../models/Proposal';
import {Button} from './button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import {Input} from './input';
import {ProposalCard} from './proposal-card';
import {VariantCard} from './variant-card';

const VariantDashboard = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
  const [graph, setGraph] = useState<Graph | null>(null);

  const [selectedStatuses, setSelectedStatuses] = useState<ProposalStatus[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const {graphId} = useParams<{graphId: string}>();
  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/graphs/${graphId}`);
        const graph: Graph = await response.json();
        setGraph(graph);
        console.log(graph);
      } catch (err) {
        console.log(graph);
      } finally {
      }
    };

    fetchGraph();
  }, [graphId]);

  const handleStatusChange = (status: ProposalStatus) => {
    setSelectedStatuses((prevStatuses) =>
      prevStatuses.includes(status)
        ? prevStatuses.filter((s) => s !== status)
        : [...prevStatuses, status]
    );
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col items-center p-4 w-full h-full">
        <div className="w-full max-w-4xl">
          <h1 className="text-2xl font-semibold">
            All schema variants for {graph?.name}
          </h1>
          <p className="text-gray-500">
            A space to test current schema variants and upcoming changes to your
            graph.
          </p>
          <div className="flex items-center space-x-2 my-4">
            <form className="relative flex-1 sm:flex-initial">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search proposals..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-8 h-10 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                />
              </div>
            </form>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.values(ProposalStatus).map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={selectedStatuses.includes(status)}
                    onCheckedChange={() => handleStatusChange(status)}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="w-full max-w-4xl space-y-4">
          {graph?.variants?.map((variant) => (
            <VariantCard key={variant.name} {...variant} />
          ))}
          {graph?.proposals.map((proposal) => (
            <ProposalCard key={proposal.id} {...proposal} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VariantDashboard;
