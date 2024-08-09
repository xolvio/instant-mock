import React, {useEffect, useState} from "react";
import {Proposal, ProposalStatus} from "../../models/Proposal";
import {CircleUser, Link, ListFilter, Package2, Search, Sheet} from "lucide-react";
import {Input} from "./input";
import {
    DropdownMenu, DropdownMenuCheckboxItem,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "./dropdown-menu";
import {Button} from "./button";
import {ProposalCard} from "./proposal-card";
import logo from "../../assets/logo.png"

const ProposalDashboard = () => {
    const port = process.env.PORT || 3001;
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<ProposalStatus[]>([]);

    useEffect(() => {
        const fetchProposals = async () => {
            try {
                const response = await fetch(`http://localhost:${port}/api/proposals`);
                const data: Proposal[] = await response.json();
                setProposals(data);
                setFilteredProposals(data);
            } catch (error) {
                console.error('Error fetching proposals:', error);
            }
        };

        fetchProposals();
    }, []);

    useEffect(() => {
        filterProposals();
    }, [proposals, selectedStatuses]);

    const handleStatusChange = (status: ProposalStatus) => {
        setSelectedStatuses(prevStatuses =>
            prevStatuses.includes(status)
                ? prevStatuses.filter(s => s !== status)
                : [...prevStatuses, status]
        );
    };

    const filterProposals = () => {
        if (selectedStatuses.length === 0) {
            setFilteredProposals(proposals);
        } else {
            setFilteredProposals(proposals.filter(proposal => selectedStatuses.includes(proposal.status)));
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col">
            <div className="p-4 bg-muted/40">
                <div className="flex flex-col items-center">
                    <div className="w-full max-w-4xl">
                        <h1 className="text-2xl font-semibold">All proposals for dev-federation
                            ({filteredProposals.length})</h1>
                        <p className="text-gray-500">A space to collaborate on upcoming changes to your graph.</p>
                        <div className="flex items-center space-x-2 my-4"> {/* Added flex container */}
                            <form className="relative flex-1 sm:flex-initial">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                                    <Input
                                        type="search"
                                        placeholder="Search proposals..."
                                        className="pl-8 h-10 sm:w-[300px] md:w-[200px] lg:w-[300px]" // Adjusted height to match the button
                                    />
                                </div>
                            </form>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm"
                                            className="h-10 gap-1"> {/* Adjusted height to match the input */}
                                        <ListFilter className="h-3.5 w-3.5"/>
                                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                        Filter
                                    </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                                    <DropdownMenuSeparator/>
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
                        {filteredProposals.map(proposal => (
                            <ProposalCard key={proposal.id} {...proposal} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
};

export default ProposalDashboard;
