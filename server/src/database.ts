import { hash, genSalt } from 'bcrypt';
import { UserData } from './routes/User';
import type { NewData } from './types';

const standardSalt = async () => await genSalt(9);

export const DB: Record<string, { email: string; hash: string }> = {
	twiggeh: {
		email: 'email@email.com',
		hash: '$2b$09$W418PL7zxfr/VzT81cD3seK8FkQNw0NFPbmTrt9tPRnaubZhUw7WG',
	},
};

export const addOneUser = async ({ email, password }: Required<UserData>) => {
	if (DB[email]) throw `User ${email} already exists`;

	DB[email] = { email, hash: await hash(password, await standardSalt()) };

	return DB[email];
};

export const deleteOneUser = async (email: string) => {
	if (!DB[email]) throw `User ${email} doesn't exists`;
	delete DB[email];
};

export const findOneUser = async ({ email, password }: UserData) => {
	if (!email && !password) throw 'Cannot find User with empty Query';
	if (email && !password) return DB[email];

	const hashedPassword =
		password !== undefined ? await hash(password, await standardSalt()) : undefined;

	for (const userName in DB) {
		const user = DB[userName];
		if (user.email === email || user.hash === hashedPassword) return user;
	}

	return undefined;
};

export const findOneUserAndUpdate = async (
	{ email, password }: UserData,
	{ newEmail, newPassword }: NewData<UserData>
) => {
	const updateUser = async (path: string, { email, password }: UserData) => {
		email = email ?? DB[path].email;
		password = password ?? DB[path].hash;

		if (password === undefined) throw 'Cannot have empty password';
		if (email === undefined) throw 'Cannot have empty username';

		DB[path].email = email;
		DB[path].hash = await hash(password, await standardSalt());

		return DB[path];
	};

	if (!email && !password) throw 'Cannot find User with empty Query';

	if (email && !password && DB[email])
		return await updateUser(email, { email: newEmail, password: newPassword });

	const hashedPassword =
		password !== undefined ? await hash(password, await standardSalt()) : undefined;

	for (const userName in DB) {
		const user = DB[userName];
		if (user.email === email || user.hash === hashedPassword)
			return updateUser(userName, { email: newEmail, password: newPassword });
	}

	return undefined;
};
