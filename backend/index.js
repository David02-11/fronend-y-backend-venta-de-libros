import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './db.js';
import moduleRoutes from './RUTAS/MODULOS/index.js';


const app = express();//Permite inicilizar las aplicaciones y configurar las urls
const PORT = process.env.PORT || 5000; // configuracion del puerto del backend 

app.use(cors()); // Permite las solicitudes desde cualquier origen
app.use(express.json()); //Por si tiene que leer algun formato JSON

Object.entries(moduleRoutes).forEach(([name, router]) => {
  app.use('/api/' + name, router);
});

app.get('/', (req, res) => {
  res.send('Hola estoy en el backend');
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Verificación de base de datos:', error.code || error.message);
    res.status(503).json({ status: 'unavailable', database: 'disconnected', code: error.code || 'DATABASE_ERROR' });
  }
});
/*
app.get('/api/mensaje', ( req, res) => {
   res.json({ mensaje: '¡ Conexion Existosa ! el backend responde correctamente' });
});
*/
//app.get('api/clientes', ( req, res ) => res.send('prueba'));



app.listen(PORT, () => {
  console.log(`Servidor del backen escuchado en http://localhost:${PORT}`);
});
