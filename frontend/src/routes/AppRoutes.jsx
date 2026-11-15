import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';
import POS from '../pages/pos/POS.jsx';
import Inventario from '../pages/inventario/Inventario.jsx';
import Compras from '../pages/compras/Compras.jsx';
import Caja from '../pages/caja/Caja.jsx';
import RRHH from '../pages/rrhh/RRHH.jsx';
import NotFound from '../pages/NotFound.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/pos" replace />} />
        <Route path="/pos" element={<POS />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/compras" element={<Compras />} />
        <Route path="/caja" element={<Caja />} />
        <Route path="/rrhh" element={<RRHH />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
