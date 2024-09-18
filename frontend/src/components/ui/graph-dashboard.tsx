import {ListFilter, Search} from 'lucide-react';
import React, {useEffect, useState} from 'react';
import {Graph} from '../../models/Graph';
import {Button} from './button';
import {DropdownMenu, DropdownMenuTrigger} from './dropdown-menu';
import {GraphCard} from './graph-card';
import {Input} from './input';

const GraphDashboard = () => {
  // TODO store it somewhere globally
  const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

  const [graphs, setGraphs] = useState<Graph[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGraphs = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/graphs`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setGraphs(data);
      } catch (err) {
        // setError(err.message || 'Failed to fetch graphs');
      } finally {
        setLoading(false);
      }
    };

    fetchGraphs();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col items-center p-4 w-full h-full">
        <div className="w-full max-w-4xl">
          <h1 className="text-2xl font-semibold">Graphs</h1>
          <p className="text-gray-500">
            There are {graphs.length} deployed graphs
          </p>
          <div className="flex items-center space-x-2 my-4">
            <form className="relative flex-1 sm:flex-initial">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search graphs..."
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
            </DropdownMenu>
          </div>
        </div>
        <div className="w-full max-w-4xl space-y-4">
          {graphs.map((graph, index) => (
            <GraphCard {...graph} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GraphDashboard;
