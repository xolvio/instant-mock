import React from "react";
import {useLocation} from "react-router-dom";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "./card";
import {Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator} from "./breadcrumb";

const SeedDetails = () => {
    const location = useLocation();
    const {state} = location;

    const operationName = state.operationName;
    const sequenceId = state.sequenceId;
    const operationMatchArguments = state?.operationMatchArguments ? JSON.parse(state.operationMatchArguments) : {};
    const seedResponse = state?.seedResponse ? JSON.parse(state.seedResponse) : {};

    return (
        <div className="flex justify-center items-start p-4 h-screen bg-muted/40">
            <div className="w-full max-w-4xl space-y-4">
                <Breadcrumb className="hidden md:flex">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            Dashboard
                        </BreadcrumbItem>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            Proposal Details
                        </BreadcrumbItem>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            Seed Details
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <Card x-chunk="dashboard-07-chunk-5" className="mb-4">
                    <CardHeader>
                        <CardTitle>Seed details</CardTitle>
                        <CardDescription>
                            <div className="flex items-center mb-2">
                                <span>{`Operation name: ${operationName}`}</span>
                            </div>
                            <div className="flex items-center mb-2">
                                <span>{`Sequence ID: ${sequenceId}`}</span>
                            </div>
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card x-chunk="dashboard-06-chunk-0" className="mb-4">
                    <CardHeader className="flex flex-row items-center">
                        <div>
                            <CardTitle>Matching arguments</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <pre className="bg-gray-100 p-4 rounded overflow-auto">
                            <code className="text-sm">{JSON.stringify(operationMatchArguments, null, 2)}</code>
                        </pre>
                    </CardContent>
                </Card>

                <Card x-chunk="dashboard-06-chunk-0" className="mb-4">
                    <CardHeader className="flex flex-row items-center">
                        <div>
                            <CardTitle>Response</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <pre className="bg-gray-100 p-4 rounded overflow-auto">
                            <code className="text-sm">{JSON.stringify(seedResponse, null, 2)}</code>
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SeedDetails;
