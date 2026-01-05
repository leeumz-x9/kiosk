const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'kioskpromax',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser', inputVars);
}
createUserRef.operationName = 'CreateUser';
exports.createUserRef = createUserRef;

exports.createUser = function createUser(dcOrVars, vars) {
  return executeMutation(createUserRef(dcOrVars, vars));
};

const getEventsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetEvents');
}
getEventsRef.operationName = 'GetEvents';
exports.getEventsRef = getEventsRef;

exports.getEvents = function getEvents(dc) {
  return executeQuery(getEventsRef(dc));
};

const inviteUserToEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'InviteUserToEvent', inputVars);
}
inviteUserToEventRef.operationName = 'InviteUserToEvent';
exports.inviteUserToEventRef = inviteUserToEventRef;

exports.inviteUserToEvent = function inviteUserToEvent(dcOrVars, vars) {
  return executeMutation(inviteUserToEventRef(dcOrVars, vars));
};

const getInvitationsForUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetInvitationsForUser');
}
getInvitationsForUserRef.operationName = 'GetInvitationsForUser';
exports.getInvitationsForUserRef = getInvitationsForUserRef;

exports.getInvitationsForUser = function getInvitationsForUser(dc) {
  return executeQuery(getInvitationsForUserRef(dc));
};
