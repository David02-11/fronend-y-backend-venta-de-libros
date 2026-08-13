import { useCallback, useEffect, useState } from 'react';

const API_URL = 'http://localhost:5000/api/cliente';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const cargarClientes = useCallback(async (page = 1) => {
    setStatus('Cargando…');
    try {
      const params = new URLSearchParams({ page, limit: 10, search });
      const response = await fetch(`${API_URL}?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No fue posible cargar los clientes');
      setClientes(data.cliente || []);
      setPagination(data.pagination);
      setStatus('');
    } catch (error) {
      setStatus(error.message);
    }
  }, [search]);

  useEffect(() => { cargarClientes(1); }, [cargarClientes]);

  return (
    <section>
      <h2>Gestión de clientes</h2>
      <form onSubmit={(event) => { event.preventDefault(); cargarClientes(1); }}>
        <label htmlFor="buscar">Buscar</label>{' '}
        <input id="buscar" value={search} onChange={(event) => setSearch(event.target.value)} />
        <button type="submit">Buscar</button>
      </form>
      {status && <p role="alert">{status}</p>}
      <table>
        <thead><tr><th>ID</th><th>Nombre</th><th>Teléfono</th><th>Dirección</th></tr></thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id_cliente}>
              <td>{cliente.id_cliente}</td><td>{cliente.nombre}</td>
              <td>{cliente.telefono}</td><td>{cliente.direccion}</td>
            </tr>
          ))}
          {!status && clientes.length === 0 && <tr><td colSpan="4">No se encontraron clientes.</td></tr>}
        </tbody>
      </table>
      <p>Total: {pagination.total}</p>
      <button type="button" disabled={pagination.page <= 1} onClick={() => cargarClientes(pagination.page - 1)}>Anterior</button>{' '}
      <button type="button" disabled={pagination.page * pagination.limit >= pagination.total} onClick={() => cargarClientes(pagination.page + 1)}>Siguiente</button>
    </section>
  );
}

export default Clientes;
