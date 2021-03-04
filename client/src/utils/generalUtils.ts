export const parseJWT = <Result>(
	token: string
): (Result & { iat: number; exp: number }) | undefined => {
	try {
		return JSON.parse(atob(token.split('.')[1]));
	} catch (e) {
		console.error(e);
		return undefined;
	}
};
