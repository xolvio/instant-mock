import React from "react";
import {Card, CardDescription, CardHeader, CardTitle} from "./card";
import {Badge} from "./badge";
import {Proposal} from "../../models/Proposal"
import {Clock3, User} from "lucide-react";
import {Link} from "react-router-dom";


const ProposalCard: React.FC<Proposal> = ({id, title, author, created, status}) => (
    <Link to={`/proposals/${id}`}>
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    <div className="flex items-center mb-2">
                        <User className="mr-1.5 h-4 w-4 text-gray-500"/> {/* Added icon */}
                        <span>Created by {author}</span>
                    </div>
                    <div className="flex items-center mb-2">
                        <Clock3 className="mr-1.5 h-4 w-4 text-gray-500"/> {/* Added icon */}
                        <span>Created on {new Date(created).toLocaleDateString()}</span>
                    </div>
                    <Badge className="mt-2" variant="secondary">{status}</Badge>
                </CardDescription>
            </CardHeader>
        </Card>
    </Link>
);

export {
    ProposalCard,
}