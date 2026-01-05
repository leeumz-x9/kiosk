import { CreateUserData, CreateUserVariables, GetEventsData, InviteUserToEventData, InviteUserToEventVariables, GetInvitationsForUserData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, CreateUserVariables>): UseDataConnectMutationResult<CreateUserData, CreateUserVariables>;

export function useGetEvents(options?: useDataConnectQueryOptions<GetEventsData>): UseDataConnectQueryResult<GetEventsData, undefined>;
export function useGetEvents(dc: DataConnect, options?: useDataConnectQueryOptions<GetEventsData>): UseDataConnectQueryResult<GetEventsData, undefined>;

export function useInviteUserToEvent(options?: useDataConnectMutationOptions<InviteUserToEventData, FirebaseError, InviteUserToEventVariables>): UseDataConnectMutationResult<InviteUserToEventData, InviteUserToEventVariables>;
export function useInviteUserToEvent(dc: DataConnect, options?: useDataConnectMutationOptions<InviteUserToEventData, FirebaseError, InviteUserToEventVariables>): UseDataConnectMutationResult<InviteUserToEventData, InviteUserToEventVariables>;

export function useGetInvitationsForUser(options?: useDataConnectQueryOptions<GetInvitationsForUserData>): UseDataConnectQueryResult<GetInvitationsForUserData, undefined>;
export function useGetInvitationsForUser(dc: DataConnect, options?: useDataConnectQueryOptions<GetInvitationsForUserData>): UseDataConnectQueryResult<GetInvitationsForUserData, undefined>;
