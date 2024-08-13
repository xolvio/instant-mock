import React from "react";
import {Card, CardDescription, CardHeader, CardTitle} from "./card";
import {Link} from "react-router-dom";
import {Clock3, Link as LinkIcon} from "lucide-react";


const SchemaCard = () => (
    <Link to={`/proposals/dev`}>
        <Card className="mb-4" style={{ borderColor: 'hsl(var(--primary))' }}>
            <CardHeader>
                <CardTitle>Current schema</CardTitle>
                <CardDescription>
                    <div className="flex items-center mb-2">
                        <Clock3 className="mr-1.5 h-4 w-4 text-gray-500"/> {/* Added icon */}
                        <span>Last updated on {new Date('2024-08-12T18:06:35.748Z').toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center mb-2">
                        <LinkIcon className="mr-1.5 h-4 w-4 text-gray-500"/> {/* Added icon */}
                        <span>https://api.d01i.gcp.ford.com/fordcredit/graphql</span>
                    </div>
                    {/*https://api.d01i.gcp.ford.com/fordcredit/graphql*/}
                    {/*<Badge className="mt-2" variant="secondary">{status}</Badge>*/}
                </CardDescription>
            </CardHeader>
        </Card>
    </Link>
);

export {
    SchemaCard,
}