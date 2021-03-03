import { hash, genSalt } from 'bcrypt';
const standardSalt = async () => genSalt(9);
export const DB = {
    twiggeh: {
        email: 'twiggeh',
        hash: '1234',
    },
};
export const addOneUser = async ({ email, password }) => {
    if (DB[email])
        throw `User ${email} already exists`;
    DB[email] = { email, hash: await hash(password, await standardSalt()) };
    return DB[email];
};
export const deleteOneUser = async (email) => {
    if (!DB[email])
        throw `User ${email} doesn't exists`;
    delete DB[email];
};
export const findOneUser = async ({ email, password }) => {
    if (!email && !password)
        throw 'Cannot find User with empty Query';
    if (email && !password)
        return DB[email];
    const hashedPassword = password !== undefined ? await hash(password, await standardSalt()) : undefined;
    for (const userName in DB) {
        const user = DB[userName];
        if (user.email === email || user.hash === hashedPassword)
            return user;
    }
    return undefined;
};
export const findOneUserAndUpdate = async ({ email, password }, { newEmail, newPassword }) => {
    const updateUser = async (path, { email, password }) => {
        email = email ?? DB[path].email;
        password = password ?? DB[path].hash;
        if (password === undefined)
            throw 'Cannot have empty password';
        if (email === undefined)
            throw 'Cannot have empty username';
        DB[path].email = email;
        DB[path].hash = await hash(password, await standardSalt());
        return DB[path];
    };
    if (!email && !password)
        throw 'Cannot find User with empty Query';
    if (email && !password && DB[email])
        return await updateUser(email, { email: newEmail, password: newPassword });
    const hashedPassword = password !== undefined ? await hash(password, await standardSalt()) : undefined;
    for (const userName in DB) {
        const user = DB[userName];
        if (user.email === email || user.hash === hashedPassword)
            return updateUser(userName, { email: newEmail, password: newPassword });
    }
    return undefined;
};
//# sourceMappingURL=database.js.map