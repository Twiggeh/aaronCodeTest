import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Navigation from './Navigation';
import Login from './Login';
import Logout from './Logout';
import Profile from './Profile';

const Naviagation_index = () => {
	return (
		<BrowserRouter>
			<Navigation />
			<Switch>
				<Route path='/' exact />
			</Switch>
			<Switch>
				<Route path='/login'>
					<Login />
				</Route>
			</Switch>
			<Switch>
				<Route path='/logout'>
					<Logout />
				</Route>
			</Switch>
			<Switch>
				<Route path='/profile'>
					<Profile />
				</Route>
			</Switch>
		</BrowserRouter>
	);
};

export default Naviagation_index;
