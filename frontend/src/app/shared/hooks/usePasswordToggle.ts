import { useState } from 'react'

// Función para hacer visible la contraseña
export default function usePasswordToggle() {
 const [visible, setVisible] = useState(false);

// Actualizamos el estado negando el estado anterior
 const toggle = () => setVisible((prev) => !prev);


 const type = visible ? 'text' : 'password';

 return { type, visible, toggle};
}