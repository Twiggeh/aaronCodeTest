import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router';
import { parseJWT } from '../utils/generalUtils';
import { SERVERURL } from '../constants';
import useFetch from './hooks/useFetch';
import UserCtx, { DeserializedUser } from './providers/userCtx';

const Login = () => {
	const { user, setAccessToken, setRefreshToken, setUser } = useContext(UserCtx);

	const [login, _setLogin] = useState(0);
	const sendLoginRequest = () => _setLogin(c => (c += 1));
	const [formState, setFormState] = useState({ email: '', password: '' });

	const { loading, res, error } = useFetch<LoginResult>(SERVERURL + '/v1/login', {
		hookOptions: {
			condition: login,
		},
		fetchOptions: {
			method: 'POST',
			body: JSON.stringify({ user: formState }),
			headers: { 'Content-Type': 'application/json' },
			mode: 'cors',
		},
		callbacks: {
			successCb: res => {
				if (res?.type === 'success') {
					setRefreshToken(res.refreshToken);
					setAccessToken(res.accessToken);

					const decodedToken = parseJWT<DeserializedUser>(res.accessToken);
					if (decodedToken) {
						setUser(decodedToken);
						return null;
					}
				}
			},
		},
	});

	const history = useHistory();

	useEffect(() => {
		if (user) history.push('/');
	}, [user]);

	const submitForm = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.preventDefault();
		sendLoginRequest();
	};

	const inputChange = (
		type: 'email' | 'password',
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		setFormState(c => ({ ...c, [type]: e.target.value }));
	};

	const fillForm = () => {
		setFormState({ email: 'email@email.com', password: '1234' });
	};

	return (
		<div>
			<div>
				{JSON.stringify(res)}
				{JSON.stringify(error)}
				{JSON.stringify(loading)}
			</div>
			<button onClick={fillForm}>Fill out Form</button>
			<form>
				<label htmlFor='email'>
					Email:
					<input
						type='email'
						onChange={e => inputChange('email', e)}
						value={formState.email}
					/>
				</label>
				<label htmlFor='password'>
					Password:
					<input
						type='password'
						value={formState.password}
						onChange={e => inputChange('password', e)}
					/>
				</label>
				<button type='submit' onClick={e => submitForm(e)}>
					Submit
				</button>
			</form>
		</div>
	);
};

export default Login;

type LoginResult =
	| { type: 'failure'; message: string }
	| { type: 'success'; refreshToken: string; accessToken: string };
