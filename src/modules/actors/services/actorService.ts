const actorData: Omit<Actor, '_id'> = {
  id: actorId,
  type: 'Person',
  username: fullUsername,
  preferredUsername: username,
  email: email,
  password: hashedPassword,
  displayName: displayName || username,
  summary: summary || '',
  inbox: `${actorId}/inbox`,
  outbox: `${actorId}/outbox`,
};
