import {Proposal} from '@/models/Graph';
import {Clock3, User} from 'lucide-react';
import React from 'react';
import {Link, useParams} from 'react-router-dom'; // Import useParams
import {Badge} from './badge';
import {Card, CardDescription, CardHeader, CardTitle} from './card';

const ProposalCard: React.FC<Proposal> = ({
  id,
  displayName,
  createdBy,
  createdAt,
  status,
  backingVariant,
}) => {
  const {graphId} = useParams<{graphId: string}>();

  return (
    <Link to={`/graphs/${graphId}/variants/${backingVariant.name}`}>
      {' '}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{displayName}</CardTitle>
          <CardDescription>
            <div className="flex items-center mb-2">
              <User className="mr-1.5 h-4 w-4 text-gray-500" />
              <span>Created by {createdBy.name}</span>
            </div>
            <div className="flex items-center mb-2">
              <Clock3 className="mr-1.5 h-4 w-4 text-gray-500" />
              <span>Created on {new Date(createdAt).toLocaleDateString()}</span>
            </div>
            <Badge className="mt-2" variant="secondary">
              {status}
            </Badge>
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
};

export {ProposalCard};
