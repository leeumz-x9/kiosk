import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserVariables {
  displayName: string;
  email: string;
  username: string;
}

export interface Event_Key {
  id: UUIDString;
  __typename?: 'Event_Key';
}

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

export interface Invitation_Key {
  id: UUIDString;
  __typename?: 'Invitation_Key';
}

export interface InviteUserToEventData {
  invitation_insert: Invitation_Key;
}

export interface InviteUserToEventVariables {
  eventId: UUIDString;
  invitedUserId: UUIDString;
  status: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface GetEventsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetEventsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetEventsData, undefined>;
  operationName: string;
}
export const getEventsRef: GetEventsRef;

export function getEvents(): QueryPromise<GetEventsData, undefined>;
export function getEvents(dc: DataConnect): QueryPromise<GetEventsData, undefined>;

interface InviteUserToEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: InviteUserToEventVariables): MutationRef<InviteUserToEventData, InviteUserToEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: InviteUserToEventVariables): MutationRef<InviteUserToEventData, InviteUserToEventVariables>;
  operationName: string;
}
export const inviteUserToEventRef: InviteUserToEventRef;

export function inviteUserToEvent(vars: InviteUserToEventVariables): MutationPromise<InviteUserToEventData, InviteUserToEventVariables>;
export function inviteUserToEvent(dc: DataConnect, vars: InviteUserToEventVariables): MutationPromise<InviteUserToEventData, InviteUserToEventVariables>;

interface GetInvitationsForUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetInvitationsForUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetInvitationsForUserData, undefined>;
  operationName: string;
}
export const getInvitationsForUserRef: GetInvitationsForUserRef;

export function getInvitationsForUser(): QueryPromise<GetInvitationsForUserData, undefined>;
export function getInvitationsForUser(dc: DataConnect): QueryPromise<GetInvitationsForUserData, undefined>;

