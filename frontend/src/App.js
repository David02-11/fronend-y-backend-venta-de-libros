import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/navbar';
import Modulo from './pages/modulo';
import './App.css';

const modules = [
  ['cliente', 'Clientes', 'Consulta los clientes registrados.', '/modulos/cliente'], ['libro', 'Libros', 'Explora el catalogo y el inventario.', '/modulos/libro'], ['venta', 'Ventas', 'Revisa las ventas realizadas.', '/modulos/venta'], ['detalle_venta', 'Detalle de ventas', 'Consulta los libros incluidos en cada venta.', '/modulos/detalle_venta'], ['pago', 'Pagos', 'Revisa los pagos registrados.', '/modulos/pago'], ['metodo_pago', 'Metodos de pago', 'Consulta los medios de pago disponibles.', '/modulos/metodo_pago'], ['categoria', 'Categorias', 'Organiza los libros por categoria.', '/modulos/categoria'], ['autor', 'Autores', 'Consulta los autores del catalogo.', '/modulos/autor'], ['editorial', 'Editoriales', 'Consulta las editoriales registradas.', '/modulos/editorial'], ['libro_autor', 'Libros y autores', 'Relacion entre los libros y sus autores.', '/modulos/libro_autor'], ['empleado', 'Empleados', 'Consulta el personal registrado.', '/modulos/empleado'], ['usuario', 'Usuarios', 'Consulta las cuentas de acceso.', '/modulos/usuario'], ['rol', 'Roles', 'Consulta los roles del sistema.', '/modulos/rol'], ['rol_usuario', 'Roles de usuario', 'Consulta la asignacion de roles.', '/modulos/rol_usuario']
];

function Inicio() { return <section className="home-panel"><p className="eyebrow">VENTA DE LIBROS DIGITAL</p><h1>Bienvenido a tu libreria digital</h1><p className="home-copy">Selecciona una opcion para administrar toda la informacion de tu negocio.</p><div className="module-grid">{modules.map(([module, title, description, path]) => <Link className="module-card" to={path} key={module}><span className="card-icon">{title[0]}</span><h2>{title}</h2><p>{description}</p><b>Ver informacion</b></Link>)}</div></section>; }
function App() { return <BrowserRouter><Navbar /><main className="app-container"><Routes><Route path="/" element={<Inicio />} /><Route path="/clientes" element={<Navigate to="/modulos/cliente" replace />} /><Route path="/modulos/:modulo" element={<Modulo />} /></Routes></main></BrowserRouter>; }
export default App;
