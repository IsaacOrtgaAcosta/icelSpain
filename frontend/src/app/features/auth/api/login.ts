
type loginPayload = {
    user: string,
    password: string
};

export default async function login (payload: loginPayload) {
    const user = payload.user;
    const password = payload.password;

    if(!user || !password){
        throw new Error("Campos vacíos");
    };

    try {
        console.log(`muy bien`)
        // const res = await fetch(URL, {... });
        // if(!res.ok) throw new Error("Credenciales incorrectas");
        // return await res.json();
    } catch (error) {
        throw error;
    }
}