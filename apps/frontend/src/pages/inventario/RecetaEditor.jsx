import { recetas } from '../../mocks/recetas.js';
export default function RecetaEditor() { return <p>{import.meta.env.VITE_USE_MOCK === 'true' ? `${recetas.length} receta(s) de demostración.` : 'No hay recetas cargadas.'}</p>; }
