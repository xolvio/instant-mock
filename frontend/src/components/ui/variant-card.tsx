import {Variant} from '@/models/Graph';
import {Clock3} from 'lucide-react';
import React from 'react';
import {Link, useParams} from 'react-router-dom'; // Import useParams
import {Card, CardDescription, CardHeader, CardTitle} from './card';

const VariantCard: React.FC<Variant> = (variant: Variant) => {
  const {graphId} = useParams<{graphId: string}>();

  return (
    <Link to={`/graphs/${graphId}/variants/${variant.name}`}>
      <Card className="mb-4" style={{borderColor: 'hsl(var(--primary))'}}>
        <CardHeader>
          <CardTitle>{variant.name}</CardTitle>
          <CardDescription>
            <div className="flex items-center mb-2">
              <Clock3 className="mr-1.5 h-4 w-4 text-gray-500" />
              <span>
                Created on{' '}
                {new Date(
                  variant.latestPublication?.publishedAt!
                ).toLocaleDateString()}
              </span>
            </div>
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
};

export {VariantCard};
