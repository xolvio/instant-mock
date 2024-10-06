import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {ChevronDown, ChevronUp} from 'lucide-react';
import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {Graph} from '../../models/Graph';
import {Button} from './button';
import {Card, CardContent, CardHeader, CardTitle} from './card';
import {Separator} from './separator';

const GraphCard: React.FC<Graph> = (graph: Graph) => {
  dayjs.extend(relativeTime);

  const [isContentVisible, setIsContentVisible] = useState(true);

  const toggleContentVisibility = () => {
    setIsContentVisible(!isContentVisible);
  };

  return (
    <Link to={`/graphs/${graph.id}/variants`}>
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{graph.name}</CardTitle>
          {/*TODO maybe add tooltip?*/}
          <Button
            variant={'ghost'}
            size={'icon'}
            onClick={(e) => {
              e.preventDefault(); // Prevent Link navigation when clicking the button
              toggleContentVisibility();
            }}
          >
            {isContentVisible ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </CardHeader>
        {isContentVisible && (
          <CardContent>
            <Separator />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variant name</TableHead>
                  <TableHead>Last published</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {graph.variants.map((variant) => (
                  <TableRow key={variant.name}>
                    <TableCell className="font-medium">
                      {variant.name}
                    </TableCell>
                    <TableCell>
                      {variant.latestPublication?.publishedAt
                        ? dayjs(variant.latestPublication.publishedAt).fromNow()
                        : 'never'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>
    </Link>
  );
};

export {GraphCard};
