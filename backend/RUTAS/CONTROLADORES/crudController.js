import pool from '../../db.js';

const metadataCache = new Map();

function sendDatabaseError(res, error) {
  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: 'Selecciona un registro relacionado que exista en la base de datos', code: error.code });
  }
  if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ error: 'No se puede eliminar porque el registro tiene relaciones activas', code: error.code });
  }
  const unavailable = ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'PROTOCOL_CONNECTION_LOST'].includes(error.code);
  if (unavailable) console.error('Error de base de datos:', error.code || error.message);
  res.status(unavailable ? 503 : 500).json({
    error: unavailable ? 'No fue posible conectar con la base de datos' : 'No fue posible procesar la solicitud',
    code: error.code || 'DATABASE_ERROR'
  });
}

function tableName(table) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(table)) throw new Error('Nombre de tabla no válido');
  return `\`${table}\``;
}

async function metadata(table) {
  if (!metadataCache.has(table)) {
    const [columns] = await pool.query(`SHOW COLUMNS FROM ${tableName(table)}`);
    const primaryKeys = columns.filter((column) => column.Key === 'PRI').map((column) => column.Field);
    if (!primaryKeys.length) throw new Error(`La tabla ${table} no tiene llave primaria`);
    metadataCache.set(table, { columns, primaryKeys });
  }
  return metadataCache.get(table);
}

function recordFilter(req, primaryKeys) {
  const values = primaryKeys.length === 1 ? [req.params.id] : primaryKeys.map((key) => req.params[key]);
  if (values.some((value) => value === undefined)) {
    const error = new Error(`Se requieren las llaves: ${primaryKeys.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }
  return { where: primaryKeys.map((key) => `\`${key}\` = ?`).join(' AND '), values };
}

function handlerError(res, error) {
  if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
  return sendDatabaseError(res, error);
}

export function createHandlers(table) {
  const safeTable = tableName(table);

  const listar = async (req, res) => {
    try {
      const { columns } = await metadata(table);
      const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100);
      const search = String(req.query.search || '').trim();
      const textColumns = columns.filter((column) => /char|text|varchar/i.test(column.Type));
      const where = search && textColumns.length ? ` WHERE ${textColumns.map((column) => `\`${column.Field}\` LIKE ?`).join(' OR ')}` : '';
      const params = where ? textColumns.map(() => `%${search}%`) : [];
      const [rows] = await pool.query(`SELECT * FROM ${safeTable}${where} LIMIT ? OFFSET ?`, [...params, limit, (page - 1) * limit]);
      const [count] = await pool.query(`SELECT COUNT(*) AS total FROM ${safeTable}${where}`, params);
      res.json({ [table]: rows, pagination: { page, limit, total: count[0].total } });
    } catch (error) { handlerError(res, error); }
  };

  const obtener = async (req, res) => {
    try {
      const { primaryKeys } = await metadata(table);
      const filter = recordFilter(req, primaryKeys);
      const [rows] = await pool.query(`SELECT * FROM ${safeTable} WHERE ${filter.where}`, filter.values);
      if (!rows.length) return res.status(404).json({ error: `${table} no encontrado` });
      res.json(rows[0]);
    } catch (error) { handlerError(res, error); }
  };

  const crear = async (req, res) => {
    try {
      const { columns } = await metadata(table);
      const valid = new Set(columns.filter((column) => column.Extra !== 'auto_increment').map((column) => column.Field));
      const fields = Object.keys(req.body).filter((field) => valid.has(field));
      if (!fields.length) return res.status(400).json({ error: 'No se enviaron campos válidos' });
      const [result] = await pool.query(`INSERT INTO ${safeTable} (${fields.map((field) => `\`${field}\``).join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`, fields.map((field) => req.body[field]));
      res.status(201).json({ mensaje: `${table} creado`, id: result.insertId || undefined });
    } catch (error) { handlerError(res, error); }
  };

  const actualizar = async (req, res) => {
    try {
      const { columns, primaryKeys } = await metadata(table);
      const valid = new Set(columns.map((column) => column.Field));
      const fields = Object.keys(req.body).filter((field) => valid.has(field) && !primaryKeys.includes(field));
      if (!fields.length) return res.status(400).json({ error: 'No se enviaron campos válidos' });
      const filter = recordFilter(req, primaryKeys);
      const [result] = await pool.query(`UPDATE ${safeTable} SET ${fields.map((field) => `\`${field}\` = ?`).join(', ')} WHERE ${filter.where}`, [...fields.map((field) => req.body[field]), ...filter.values]);
      if (!result.affectedRows) return res.status(404).json({ error: `${table} no encontrado` });
      res.json({ mensaje: `${table} actualizado` });
    } catch (error) { handlerError(res, error); }
  };

  const eliminar = async (req, res) => {
    try {
      const { primaryKeys } = await metadata(table);
      const filter = recordFilter(req, primaryKeys);
      const [result] = await pool.query(`DELETE FROM ${safeTable} WHERE ${filter.where}`, filter.values);
      if (!result.affectedRows) return res.status(404).json({ error: `${table} no encontrado` });
      res.json({ mensaje: `${table} eliminado` });
    } catch (error) { handlerError(res, error); }
  };

  return { listar, obtener, crear, actualizar, eliminar };
}
