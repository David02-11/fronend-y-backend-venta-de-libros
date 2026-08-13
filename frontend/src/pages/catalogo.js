import { useEffect, useMemo, useState } from 'react';

const API = 'http://localhost:5000/api';
const money = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

function Catalogo({ onAdd }) {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { Promise.all([fetch(`${API}/libro?limit=100`), fetch(`${API}/categoria?limit=100`)]).then(async ([booksResponse, categoriesResponse]) => { const booksBody = await booksResponse.json(); const categoriesBody = await categoriesResponse.json(); if (!booksResponse.ok || !categoriesResponse.ok) throw new Error('No fue posible cargar el cat\u00e1logo'); setBooks(booksBody.libro || []); setCategories(categoriesBody.categoria || []); }).catch((requestError) => setError(requestError.message)); }, []);
  const categoryName = Object.fromEntries(categories.map((item) => [item.id_categoria, item.nombre]));
  const filtered = useMemo(() => books.filter((book) => (!search || book.titulo.toLowerCase().includes(search.toLowerCase())) && (!category || String(book.id_categoria) === category)), [books, search, category]);
  return <section><div className="hero"><p>LIBRERIA DIGITAL</p><h1>Encuentra tu proxima lectura</h1><span>Catalogo conectado a tu inventario real.</span></div><div className="catalog-tools"><input aria-label="Buscar libros" placeholder="Buscar por titulo" value={search} onChange={(event) => setSearch(event.target.value)} /><select aria-label="Filtrar por categoria" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Todas las categorias</option>{categories.map((item) => <option key={item.id_categoria} value={item.id_categoria}>{item.nombre}</option>)}</select></div>{error && <p role="alert" className="error">{error}</p>}<p className="catalog-count">{filtered.length} libros disponibles</p><div className="book-grid">{filtered.map((book) => <article className="book-card" key={book.id_libro}><div className="book-cover"><span>LIBRO DIGITAL</span><strong>{book.titulo}</strong></div><p className="book-category">{categoryName[book.id_categoria] || 'Sin categoria'}</p><h2>{book.titulo}</h2><p className="book-price">{money.format(book.precio)}</p><p className={book.stock > 0 ? 'stock' : 'stock sold-out'}>{book.stock > 0 ? `${book.stock} disponibles` : 'Agotado'}</p><button type="button" disabled={!book.stock} onClick={() => onAdd(book)}>Agregar al carrito</button></article>)}</div></section>;
}

export default Catalogo;
