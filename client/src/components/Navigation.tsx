import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import UserCtx from './providers/userCtx';

const Navigation_index = () => {
	const history = useHistory();
	const { user } = useContext(UserCtx);

	const goToPage = (
		page: 'login' | 'logout' | 'profile' | 'home',
		e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
	) => {
		e.preventDefault();
		history.push(page);
	};

	return (
		<nav>
			<ul>
				<li>
					<a onClick={e => goToPage('home', e)}>Home</a>
				</li>

				{user ? (
					<>
						<li>
							<a onClick={e => goToPage('logout', e)}>Logout</a>
						</li>
						<li>
							<a onClick={e => goToPage('profile', e)}>Profile</a>
						</li>
					</>
				) : (
					<li>
						<a onClick={e => goToPage('login', e)}>Login</a>
					</li>
				)}
			</ul>
		</nav>
	);
};

export default Navigation_index;
