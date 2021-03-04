import React from 'react';
import './App.css';
import Body from './components/Body';
import UserCtx, { useUser } from './components/providers/userCtx';

const App = () => {
	const userContext = useUser();

	return (
		<>
			<UserCtx.Provider value={userContext}>
				<Body />
			</UserCtx.Provider>
		</>
	);
};

export default App;
