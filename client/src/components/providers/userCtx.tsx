/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext, useState } from 'react';
import { SERVERURL } from '../../constants';
import useFetch from '../hooks/useFetch';
import useLocalStorage from '../hooks/useLocalStorage';

export const useUser = (): UserCtx => {
	const [updateAccessCondition, _updateAccess] = useState(false);

	const updateAccess = () => {
		_updateAccess(true);
	};

	const [user, setUser] = useLocalStorage<DeserializedUser | undefined>(
		'user',
		undefined
	);

	const [refreshToken, setRefreshToken] = useLocalStorage<string | undefined>(
		'refreshToken',
		undefined
	);

	const [accessToken, setAccessToken] = useLocalStorage<string | undefined>(
		'accessToken',
		undefined
	);

	useFetch<
		{ type: 'success'; accessToken: string } | { type: 'failure'; message: string }
	>(SERVERURL + '/v1/token', {
		hookOptions: {
			condition: updateAccessCondition,
		},
		fetchOptions: {
			method: 'POST',
			mode: 'cors',
			body: JSON.stringify({
				token: refreshToken,
			}),
			headers: {
				'Content-Type': 'application/json',
			},
		},
		callbacks: {
			successCb: res => {
				if (res.type === 'success') {
					setAccessToken(res.accessToken);
					_updateAccess(false);
				}
				if (res.type === 'failure') {
					setUser(undefined);
					setRefreshToken(undefined);
					setAccessToken(undefined);
				}
			},
			finalCb: () => _updateAccess(false),
		},
	});

	return {
		user,
		refreshToken,
		accessToken,
		updateAccess,
		setAccessToken,
		setRefreshToken,
		setUser,
	};
};

const DefaultUserCtx: UserCtx = {
	setUser: () => {},
	refreshToken: undefined,
	accessToken: undefined,
	updateAccess: () => {},
	setRefreshToken: () => {},
	setAccessToken: () => {},
};

const UserCtx = createContext(DefaultUserCtx);

export default UserCtx;

export type DeserializedUser = {
	email: string;
};

type UserCtx = {
	user?: DeserializedUser;
	setUser: (value: DeserializedUser | undefined) => void;
	updateAccess: () => void;
	refreshToken: string | undefined;
	accessToken: string | undefined;
	setRefreshToken: (value: string | undefined) => void;
	setAccessToken: (value: string | undefined) => void;
};
