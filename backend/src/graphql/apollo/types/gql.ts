/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
const documents = {
    "\n  mutation createProposal($graphId: ID!, $input: CreateProposalInput!) {\n    graph(id: $graphId) {\n      createProposal(input: $input) {\n        ... on GraphVariant {\n          name\n          subgraphs {\n            revision\n          }\n          proposal {\n            id\n          }\n          latestLaunch {\n            id\n          }\n        }\n        ... on CreateProposalError {\n          message\n        }\n        ... on PermissionError {\n          message\n        }\n        ... on ValidationError {\n          message\n        }\n      }\n    }\n  }\n": types.CreateProposalDocument,
    "\n  mutation PublishProposalRevision(\n    $proposalId: ID!\n    $input: PublishProposalSubgraphsInput!\n  ) {\n    proposal(id: $proposalId) {\n      ... on ProposalMutation {\n        publishSubgraphs(input: $input) {\n          ... on PermissionError {\n            message\n          }\n          ... on ValidationError {\n            message\n          }\n          ... on NotFoundError {\n            message\n          }\n          ... on Error {\n            message\n          }\n          ... on Proposal {\n            id\n            displayName\n            backingVariant {\n              id\n              name\n              subgraphs {\n                revision\n              }\n              proposal {\n                id\n              }\n              latestLaunch {\n                id\n              }\n            }\n          }\n        }\n      }\n      ... on ValidationError {\n        message\n      }\n      ... on NotFoundError {\n        message\n      }\n      ... on PermissionError {\n        message\n      }\n    }\n  }\n": types.PublishProposalRevisionDocument,
    "\n  mutation UpdateProposalStatus($proposalId: ID!, $status: ProposalStatus!) {\n    proposal(id: $proposalId) {\n      ... on ProposalMutation {\n        updateStatus(status: $status) {\n          ... on Proposal {\n            id\n            status\n          }\n          ... on PermissionError {\n            message\n          }\n          ... on ValidationError {\n            message\n          }\n        }\n      }\n    }\n  }\n": types.UpdateProposalStatusDocument,
    "\n  query GetGraph($graphId: ID!, $filterBy: ProposalsFilterInput) {\n    graph(id: $graphId) {\n      variants {\n        key: id\n        displayName: name\n        name\n        latestPublication {\n          publishedAt\n          schema {\n            document\n          }\n        }\n      }\n      proposals(filterBy: $filterBy, limit: 100) {\n        proposals {\n          displayName\n          key: backingVariant {\n            key: id\n          }\n          latestPublication: backingVariant {\n            latestPublication {\n              schema {\n                document\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": types.GetGraphDocument,
    "\n  query GetGraphWithSubgraphs($graphId: ID!, $filterBy: ProposalsFilterInput) {\n    graph(id: $graphId) {\n      variants {\n        key: id\n        displayName: name\n        name\n        latestPublication {\n          publishedAt\n          schema {\n            document\n          }\n        }\n        subgraphs {\n          name\n          activePartialSchema {\n            sdl\n          }\n        }\n      }\n      proposals(filterBy: $filterBy, limit: 100) {\n        proposals {\n          displayName\n          key: backingVariant {\n            key: id\n          }\n          latestPublication: backingVariant {\n            latestPublication {\n              schema {\n                document\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": types.GetGraphWithSubgraphsDocument,
    "\n  query GetGraphs($organizationId: ID!) {\n    organization(id: $organizationId) {\n      graphs {\n        id\n        name\n        variants {\n          id\n          name\n          latestPublication {\n            publishedAt\n          }\n        }\n        proposals {\n          totalCount\n        }\n      }\n    }\n  }\n": types.GetGraphsDocument,
    "\n  query GetOrganizationId {\n    me {\n      ... on User {\n        memberships {\n          account {\n            id\n          }\n        }\n      }\n    }\n  }\n": types.GetOrganizationIdDocument,
    "\n  query GetSchema($graphId: ID!, $name: String!) {\n    graph(id: $graphId) {\n      variant(name: $name) {\n        id\n        url\n        latestPublication {\n          schema {\n            document\n          }\n        }\n      }\n    }\n  }\n": types.GetSchemaDocument,
    "\n  query GetVariant($graphId: ID!, $name: String!) {\n    graph(id: $graphId) {\n      variant(name: $name) {\n        id\n        proposal {\n          id\n        }\n        url\n        subgraphs {\n          name\n          activePartialSchema {\n            sdl\n          }\n        }\n        latestLaunch {\n          id\n        }\n        isProposal\n        latestPublication {\n          publishedAt\n          schema {\n            document\n          }\n        }\n        name\n      }\n    }\n  }\n": types.GetVariantDocument,
    "\n  query ProposalLaunches($proposalId: ID!) {\n    proposal(id: $proposalId) {\n      backingVariant {\n        id\n        name\n      }\n      activities {\n        edges {\n          node {\n            target {\n              ... on ProposalRevision {\n                launch {\n                  status\n                  id\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": types.ProposalLaunchesDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createProposal($graphId: ID!, $input: CreateProposalInput!) {\n    graph(id: $graphId) {\n      createProposal(input: $input) {\n        ... on GraphVariant {\n          name\n          subgraphs {\n            revision\n          }\n          proposal {\n            id\n          }\n          latestLaunch {\n            id\n          }\n        }\n        ... on CreateProposalError {\n          message\n        }\n        ... on PermissionError {\n          message\n        }\n        ... on ValidationError {\n          message\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation createProposal($graphId: ID!, $input: CreateProposalInput!) {\n    graph(id: $graphId) {\n      createProposal(input: $input) {\n        ... on GraphVariant {\n          name\n          subgraphs {\n            revision\n          }\n          proposal {\n            id\n          }\n          latestLaunch {\n            id\n          }\n        }\n        ... on CreateProposalError {\n          message\n        }\n        ... on PermissionError {\n          message\n        }\n        ... on ValidationError {\n          message\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation PublishProposalRevision(\n    $proposalId: ID!\n    $input: PublishProposalSubgraphsInput!\n  ) {\n    proposal(id: $proposalId) {\n      ... on ProposalMutation {\n        publishSubgraphs(input: $input) {\n          ... on PermissionError {\n            message\n          }\n          ... on ValidationError {\n            message\n          }\n          ... on NotFoundError {\n            message\n          }\n          ... on Error {\n            message\n          }\n          ... on Proposal {\n            id\n            displayName\n            backingVariant {\n              id\n              name\n              subgraphs {\n                revision\n              }\n              proposal {\n                id\n              }\n              latestLaunch {\n                id\n              }\n            }\n          }\n        }\n      }\n      ... on ValidationError {\n        message\n      }\n      ... on NotFoundError {\n        message\n      }\n      ... on PermissionError {\n        message\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation PublishProposalRevision(\n    $proposalId: ID!\n    $input: PublishProposalSubgraphsInput!\n  ) {\n    proposal(id: $proposalId) {\n      ... on ProposalMutation {\n        publishSubgraphs(input: $input) {\n          ... on PermissionError {\n            message\n          }\n          ... on ValidationError {\n            message\n          }\n          ... on NotFoundError {\n            message\n          }\n          ... on Error {\n            message\n          }\n          ... on Proposal {\n            id\n            displayName\n            backingVariant {\n              id\n              name\n              subgraphs {\n                revision\n              }\n              proposal {\n                id\n              }\n              latestLaunch {\n                id\n              }\n            }\n          }\n        }\n      }\n      ... on ValidationError {\n        message\n      }\n      ... on NotFoundError {\n        message\n      }\n      ... on PermissionError {\n        message\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateProposalStatus($proposalId: ID!, $status: ProposalStatus!) {\n    proposal(id: $proposalId) {\n      ... on ProposalMutation {\n        updateStatus(status: $status) {\n          ... on Proposal {\n            id\n            status\n          }\n          ... on PermissionError {\n            message\n          }\n          ... on ValidationError {\n            message\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateProposalStatus($proposalId: ID!, $status: ProposalStatus!) {\n    proposal(id: $proposalId) {\n      ... on ProposalMutation {\n        updateStatus(status: $status) {\n          ... on Proposal {\n            id\n            status\n          }\n          ... on PermissionError {\n            message\n          }\n          ... on ValidationError {\n            message\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetGraph($graphId: ID!, $filterBy: ProposalsFilterInput) {\n    graph(id: $graphId) {\n      variants {\n        key: id\n        displayName: name\n        name\n        latestPublication {\n          publishedAt\n          schema {\n            document\n          }\n        }\n      }\n      proposals(filterBy: $filterBy, limit: 100) {\n        proposals {\n          displayName\n          key: backingVariant {\n            key: id\n          }\n          latestPublication: backingVariant {\n            latestPublication {\n              schema {\n                document\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetGraph($graphId: ID!, $filterBy: ProposalsFilterInput) {\n    graph(id: $graphId) {\n      variants {\n        key: id\n        displayName: name\n        name\n        latestPublication {\n          publishedAt\n          schema {\n            document\n          }\n        }\n      }\n      proposals(filterBy: $filterBy, limit: 100) {\n        proposals {\n          displayName\n          key: backingVariant {\n            key: id\n          }\n          latestPublication: backingVariant {\n            latestPublication {\n              schema {\n                document\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetGraphWithSubgraphs($graphId: ID!, $filterBy: ProposalsFilterInput) {\n    graph(id: $graphId) {\n      variants {\n        key: id\n        displayName: name\n        name\n        latestPublication {\n          publishedAt\n          schema {\n            document\n          }\n        }\n        subgraphs {\n          name\n          activePartialSchema {\n            sdl\n          }\n        }\n      }\n      proposals(filterBy: $filterBy, limit: 100) {\n        proposals {\n          displayName\n          key: backingVariant {\n            key: id\n          }\n          latestPublication: backingVariant {\n            latestPublication {\n              schema {\n                document\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetGraphWithSubgraphs($graphId: ID!, $filterBy: ProposalsFilterInput) {\n    graph(id: $graphId) {\n      variants {\n        key: id\n        displayName: name\n        name\n        latestPublication {\n          publishedAt\n          schema {\n            document\n          }\n        }\n        subgraphs {\n          name\n          activePartialSchema {\n            sdl\n          }\n        }\n      }\n      proposals(filterBy: $filterBy, limit: 100) {\n        proposals {\n          displayName\n          key: backingVariant {\n            key: id\n          }\n          latestPublication: backingVariant {\n            latestPublication {\n              schema {\n                document\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetGraphs($organizationId: ID!) {\n    organization(id: $organizationId) {\n      graphs {\n        id\n        name\n        variants {\n          id\n          name\n          latestPublication {\n            publishedAt\n          }\n        }\n        proposals {\n          totalCount\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetGraphs($organizationId: ID!) {\n    organization(id: $organizationId) {\n      graphs {\n        id\n        name\n        variants {\n          id\n          name\n          latestPublication {\n            publishedAt\n          }\n        }\n        proposals {\n          totalCount\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetOrganizationId {\n    me {\n      ... on User {\n        memberships {\n          account {\n            id\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetOrganizationId {\n    me {\n      ... on User {\n        memberships {\n          account {\n            id\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetSchema($graphId: ID!, $name: String!) {\n    graph(id: $graphId) {\n      variant(name: $name) {\n        id\n        url\n        latestPublication {\n          schema {\n            document\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetSchema($graphId: ID!, $name: String!) {\n    graph(id: $graphId) {\n      variant(name: $name) {\n        id\n        url\n        latestPublication {\n          schema {\n            document\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetVariant($graphId: ID!, $name: String!) {\n    graph(id: $graphId) {\n      variant(name: $name) {\n        id\n        proposal {\n          id\n        }\n        url\n        subgraphs {\n          name\n          activePartialSchema {\n            sdl\n          }\n        }\n        latestLaunch {\n          id\n        }\n        isProposal\n        latestPublication {\n          publishedAt\n          schema {\n            document\n          }\n        }\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetVariant($graphId: ID!, $name: String!) {\n    graph(id: $graphId) {\n      variant(name: $name) {\n        id\n        proposal {\n          id\n        }\n        url\n        subgraphs {\n          name\n          activePartialSchema {\n            sdl\n          }\n        }\n        latestLaunch {\n          id\n        }\n        isProposal\n        latestPublication {\n          publishedAt\n          schema {\n            document\n          }\n        }\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ProposalLaunches($proposalId: ID!) {\n    proposal(id: $proposalId) {\n      backingVariant {\n        id\n        name\n      }\n      activities {\n        edges {\n          node {\n            target {\n              ... on ProposalRevision {\n                launch {\n                  status\n                  id\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query ProposalLaunches($proposalId: ID!) {\n    proposal(id: $proposalId) {\n      backingVariant {\n        id\n        name\n      }\n      activities {\n        edges {\n          node {\n            target {\n              ... on ProposalRevision {\n                launch {\n                  status\n                  id\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;