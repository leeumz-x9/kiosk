import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'kioskpromax',
  location: 'us-east4'
};

export const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser', inputVars);
}
createUserRef.operationName = 'CreateUser';

export function createUser(dcOrVars, vars) {
  return executeMutation(createUserRef(dcOrVars, vars));
}

export const getEventsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetEvents');
}
getEventsRef.operationName = 'GetEvents';

export function getEvents(dc) {
  return executeQuery(getEventsRef(dc));
}

export const inviteUserToEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'InviteUserToEvent', inputVars);
}
inviteUserToEventRef.operationName = 'InviteUserToEvent';

export function inviteUserToEvent(dcOrVars, vars) {
  return executeMutation(inviteUserToEventRef(dcOrVars, vars));
}

export const getInvitationsForUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetInvitationsForUser');
}
getInvitationsForUserRef.operationName = 'GetInvitationsForUser';

export function getInvitationsForUser(dc) {
  return executeQuery(getInvitationsForUserRef(dc));
}

