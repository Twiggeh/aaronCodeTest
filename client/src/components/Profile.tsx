import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { parseJWT } from '../utils/generalUtils';
import { SERVERURL } from '../constants';
import useFetch from './hooks/useFetch';
import UserCtx from './providers/userCtx';

const Profile = () => {
	const { user, accessToken, updateAccess } = useContext(UserCtx);
	const [secretMessage, setSecretMessage] = useState<string | null>(null);

	const history = useHistory();

	const JWTExpired = accessToken && parseJWT(accessToken)?.exp;

	// TODO:  Move into the getter of accessToken on  UserCTX

	const needsUpdating = typeof JWTExpired === 'number' && JWTExpired < Date.now();

	useEffect(() => {
		if (needsUpdating) updateAccess();
	}, [needsUpdating]);

	const { loading, error } = useFetch<{
		type: 'success' | 'failure';
		message: string;
	}>(SERVERURL + '/v1/profile', {
		hookOptions: {
			condition: !needsUpdating,
		},
		fetchOptions: {
			method: 'POST',
			headers: { Authorization: `Bearer ${accessToken}` },
		},
		callbacks: {
			successCb: res => {
				if (res.type === 'success') setSecretMessage(res.message);
			},
		},
	});

	useEffect(() => {
		if (!user) history.push('/');
	}, [user]);

	if (!user) return null;

	return (
		<>
			{loading ? 'loading ...' : null}
			{JSON.stringify(error)}
			{secretMessage}
			<div>Email: {user.email}</div>
			<div>Super Secret Data: </div>
		</>
	);
};

export default Profile;
