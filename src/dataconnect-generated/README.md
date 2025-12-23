# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetEvents*](#getevents)
  - [*GetInvitationsForUser*](#getinvitationsforuser)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*InviteUserToEvent*](#inviteusertoevent)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetEvents
You can execute the `GetEvents` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getEvents(): QueryPromise<GetEventsData, undefined>;

interface GetEventsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetEventsData, undefined>;
}
export const getEventsRef: GetEventsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getEvents(dc: DataConnect): QueryPromise<GetEventsData, undefined>;

interface GetEventsRef {
  ...
  (dc: DataConnect): QueryRef<GetEventsData, undefined>;
}
export const getEventsRef: GetEventsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getEventsRef:
```typescript
const name = getEventsRef.operationName;
console.log(name);
```

### Variables
The `GetEvents` query has no variables.
### Return Type
Recall that executing the `GetEvents` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetEventsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetEventsData {
  events: ({
    id: UUIDString;
    title: string;
    description?: string | null;
    eventDate: DateString;
    location: string;
    organizer: {
      id: UUIDString;
      username: string;
      displayName?: string | null;
    } & User_Key;
  } & Event_Key)[];
}
```
### Using `GetEvents`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getEvents } from '@dataconnect/generated';


// Call the `getEvents()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getEvents();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getEvents(dataConnect);

console.log(data.events);

// Or, you can use the `Promise` API.
getEvents().then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

### Using `GetEvents`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getEventsRef } from '@dataconnect/generated';


// Call the `getEventsRef()` function to get a reference to the query.
const ref = getEventsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getEventsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.events);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.events);
});
```

## GetInvitationsForUser
You can execute the `GetInvitationsForUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getInvitationsForUser(): QueryPromise<GetInvitationsForUserData, undefined>;

interface GetInvitationsForUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetInvitationsForUserData, undefined>;
}
export const getInvitationsForUserRef: GetInvitationsForUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getInvitationsForUser(dc: DataConnect): QueryPromise<GetInvitationsForUserData, undefined>;

interface GetInvitationsForUserRef {
  ...
  (dc: DataConnect): QueryRef<GetInvitationsForUserData, undefined>;
}
export const getInvitationsForUserRef: GetInvitationsForUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getInvitationsForUserRef:
```typescript
const name = getInvitationsForUserRef.operationName;
console.log(name);
```

### Variables
The `GetInvitationsForUser` query has no variables.
### Return Type
Recall that executing the `GetInvitationsForUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetInvitationsForUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetInvitationsForUserData {
  invitations: ({
    id: UUIDString;
    event: {
      id: UUIDString;
      title: string;
      eventDate: DateString;
      location: string;
    } & Event_Key;
      status: string;
      responseDate?: TimestampString | null;
  } & Invitation_Key)[];
}
```
### Using `GetInvitationsForUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getInvitationsForUser } from '@dataconnect/generated';


// Call the `getInvitationsForUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getInvitationsForUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getInvitationsForUser(dataConnect);

console.log(data.invitations);

// Or, you can use the `Promise` API.
getInvitationsForUser().then((response) => {
  const data = response.data;
  console.log(data.invitations);
});
```

### Using `GetInvitationsForUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getInvitationsForUserRef } from '@dataconnect/generated';


// Call the `getInvitationsForUserRef()` function to get a reference to the query.
const ref = getInvitationsForUserRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getInvitationsForUserRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.invitations);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.invitations);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation requires an argument of type `CreateUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateUserVariables {
  displayName: string;
  email: string;
  username: string;
}
```
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser, CreateUserVariables } from '@dataconnect/generated';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  displayName: ..., 
  email: ..., 
  username: ..., 
};

// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser(createUserVars);
// Variables can be defined inline as well.
const { data } = await createUser({ displayName: ..., email: ..., username: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect, createUserVars);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser(createUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef, CreateUserVariables } from '@dataconnect/generated';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  displayName: ..., 
  email: ..., 
  username: ..., 
};

// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef(createUserVars);
// Variables can be defined inline as well.
const ref = createUserRef({ displayName: ..., email: ..., username: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect, createUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## InviteUserToEvent
You can execute the `InviteUserToEvent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
inviteUserToEvent(vars: InviteUserToEventVariables): MutationPromise<InviteUserToEventData, InviteUserToEventVariables>;

interface InviteUserToEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: InviteUserToEventVariables): MutationRef<InviteUserToEventData, InviteUserToEventVariables>;
}
export const inviteUserToEventRef: InviteUserToEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
inviteUserToEvent(dc: DataConnect, vars: InviteUserToEventVariables): MutationPromise<InviteUserToEventData, InviteUserToEventVariables>;

interface InviteUserToEventRef {
  ...
  (dc: DataConnect, vars: InviteUserToEventVariables): MutationRef<InviteUserToEventData, InviteUserToEventVariables>;
}
export const inviteUserToEventRef: InviteUserToEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the inviteUserToEventRef:
```typescript
const name = inviteUserToEventRef.operationName;
console.log(name);
```

### Variables
The `InviteUserToEvent` mutation requires an argument of type `InviteUserToEventVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface InviteUserToEventVariables {
  eventId: UUIDString;
  invitedUserId: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `InviteUserToEvent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `InviteUserToEventData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface InviteUserToEventData {
  invitation_insert: Invitation_Key;
}
```
### Using `InviteUserToEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, inviteUserToEvent, InviteUserToEventVariables } from '@dataconnect/generated';

// The `InviteUserToEvent` mutation requires an argument of type `InviteUserToEventVariables`:
const inviteUserToEventVars: InviteUserToEventVariables = {
  eventId: ..., 
  invitedUserId: ..., 
  status: ..., 
};

// Call the `inviteUserToEvent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await inviteUserToEvent(inviteUserToEventVars);
// Variables can be defined inline as well.
const { data } = await inviteUserToEvent({ eventId: ..., invitedUserId: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await inviteUserToEvent(dataConnect, inviteUserToEventVars);

console.log(data.invitation_insert);

// Or, you can use the `Promise` API.
inviteUserToEvent(inviteUserToEventVars).then((response) => {
  const data = response.data;
  console.log(data.invitation_insert);
});
```

### Using `InviteUserToEvent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, inviteUserToEventRef, InviteUserToEventVariables } from '@dataconnect/generated';

// The `InviteUserToEvent` mutation requires an argument of type `InviteUserToEventVariables`:
const inviteUserToEventVars: InviteUserToEventVariables = {
  eventId: ..., 
  invitedUserId: ..., 
  status: ..., 
};

// Call the `inviteUserToEventRef()` function to get a reference to the mutation.
const ref = inviteUserToEventRef(inviteUserToEventVars);
// Variables can be defined inline as well.
const ref = inviteUserToEventRef({ eventId: ..., invitedUserId: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = inviteUserToEventRef(dataConnect, inviteUserToEventVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.invitation_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.invitation_insert);
});
```

