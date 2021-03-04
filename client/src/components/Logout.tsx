import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router';
import UserCtx from './providers/userCtx';

const Logout = () => {
	const { user, setUser } = useContext(UserCtx);
	const history = useHistory();

	useEffect(() => {
		if (!user) history.push('/');
	}, [user]);

	return <button onClick={() => setUser(undefined)}>Logout</button>;
};

export default Logout;
