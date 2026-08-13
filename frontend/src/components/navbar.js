import { Link } from 'react-router-dom';

function Navbar() {
  return <nav className="site-nav"><Link className="brand" to="/"><span>VD</span> Venta de Libros Digital</Link><div className="nav-links"><Link to="/">Inicio</Link><Link to="/modulos/cliente">Clientes</Link><Link to="/modulos/libro">Libros</Link><Link to="/modulos/venta">Ventas</Link><Link to="/modulos/pago">Pagos</Link></div></nav>;
}

export default Navbar;
