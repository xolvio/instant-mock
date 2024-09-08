import React from 'react';
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
import {Card, CardContent, CardHeader, CardTitle} from './card';
import {Separator} from './separator';

const GraphCard: React.FC<Graph> = (graph: Graph) => {
  return (
    <Link to={`/graphs/${graph.id}/variants`}>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{graph.name}</CardTitle>
        </CardHeader>
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
                  <TableCell className="font-medium">{variant.name}</TableCell>
                  <TableCell>
                    {/*TODO format this date to use 2 hours ago, 3 monhts ago, last year, etc...*/}
                    {variant.latestPublication?.publishedAt}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Link>
  );
};

export {GraphCard};
