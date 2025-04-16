const express = require('express');
const axios = require('axios');
const cors = require('cors');
const promBundle = require('express-prom-bundle');
//libraries required for OpenAPI-Swagger
const swaggerUi = require('swagger-ui-express');
const fs = require("fs")
const YAML = require('yaml');

const app = express();
const port = 8000;

const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8001';
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:8002';
const llmServiceUrl = process.env.LLM_SERVICE_URL || 'http://localhost:8003';
const questionServiceUrl = process.env.QUESTION_SERVICE_URL || 'http://localhost:8004';

app.use(cors());
app.use(express.json());

const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);

// NO BORREIS ESTO QUE ES PARA LOS TESTS DE ACEPTACION GRACIAS BESUS DANI
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

app.post('/login', async (req, res) => {
    try {
        const authResponse = await axios.post(authServiceUrl+'/login', req.body);
        res.json(authResponse.data);
    } catch (error) {
        res.status(error.response.status).json({ error: error.response.data.error });
    }
});

// Endpoint: Obtener estadísticas de un usuario
app.get('/stats/:username', async (req, res) => {
  try {
      const username = req.params.username;
      const statsResponse = await axios.get(`${userServiceUrl}/stats/${username}`);
      res.json(statsResponse.data);
  } catch (error) {
      res.status(error?.response?.status || 500).json({
          error: error?.response?.data?.error || error.message || 'Error interno'
      });
  }
});

// Endpoint: Actualizar estadísticas de un usuario
app.post('/stats', async (req, res) => {
  try {
      const statsResponse = await axios.post(`${userServiceUrl}/stats`, req.body);
      res.json(statsResponse.data);
  } catch (error) {
      res.status(error?.response?.status || 500).json({
          error: error?.response?.data?.error || error.message || 'Error interno'
      });
  }
});

// Endpoint: Obtener ranking completo
app.get('/getStats', async (req, res) => {
  try {
      const response = await axios.get(`${userServiceUrl}/getStats`);
      res.json(response.data);
  } catch (error) {
      res.status(error?.response?.status || 500).json({
          error: error?.response?.data?.error || error.message || 'Error interno'
      });
  }
});

// Endpoint: Obtener preguntas por categoría
app.get('/questions/:category', async (req, res) => {
    try{
        console.log(`Gateway - Solicitando preguntas para categoría: ${req.params.category}`);
        console.log(`Gateway - URL completa: ${questionServiceUrl}/questions/${req.params.category}`);
        
        const category = req.params.category;
        const questionResponse = await axios.get(`${questionServiceUrl}/questions/${category}`);
        console.log(`Gateway - Respuesta recibida correctamente para ${category}`);
        res.json(questionResponse.data);
    } catch (error) {
        console.error(`Gateway - Error al solicitar preguntas para ${req.params.category}:`, error.message);
        if (error.response) {
            console.error(`Gateway - Código de estado: ${error.response.status}`);
            console.error(`Gateway - Respuesta del servidor: `, error.response.data);
        } else if (error.request) {
            console.error(`Gateway - No se recibió respuesta del servidor`);
        }
        
        res.status(error?.response?.status || 500).json({
            error: error?.response?.data?.error || error.message || 'Error interno'
        });
    }
});

app.post('/initializeQuestionsDB', async (req, res) => {
    try{
        console.log(`Gateway - Inicializando la base de datos de preguntas`);
        await axios.post(`${questionServiceUrl}/initializeQuestionsDB`, req.body);
        res.status(200).json({ message: 'Preguntas inicializadas correctamente' });
    } catch(error){
        console.error(`Gateway - Error al inicializar la base de datos de preguntas:`, error.message);
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
      const authResponse = await axios.post(`${authServiceUrl}/login`, req.body);
      res.json(authResponse.data);
  } catch (error) {
      res.status(error?.response?.status || 500).json({
          error: error?.response?.data?.error || error.message || 'Error interno'
      });
  }
});

// Add user endpoint
app.post('/adduser', async (req, res) => {
  try {
      const userResponse = await axios.post(`${userServiceUrl}/adduser`, req.body);
      res.json(userResponse.data);
  } catch (error) {
      res.status(error?.response?.status || 500).json({
          error: error?.response?.data?.error || error.message || 'Error interno'
      });
  }
});

// Endpoint para pedir pistas al LLM para el juego
app.post('/game-hint', async (req, res) => {
    try {
        const { question, solution, options, userMessage } = req.body;
        console.log("Request to game-hint:", req.body);
        
        // Reenviar la solicitud directamente al servicio LLM
        const response = await axios.post(`${llmServiceUrl}/game-hint`, {
            question,
            solution,
            options,
            userMessage
        });
        
        res.json(response.data);
    } catch (error) {
        console.error("Error in game-hint endpoint:", error);
        res.status(error?.response?.status || 500).json({
            error: error?.response?.data?.error || error.message || 'Error interno al procesar la pista'
        });
    }
});

// Swagger config
const openapiPath = './openapi.yaml';
if (fs.existsSync(openapiPath)) {
    const file = fs.readFileSync(openapiPath, 'utf8');

    const swaggerDocument = YAML.parse(file);
    app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
    console.log("Not configuring OpenAPI. Configuration file not present.")
}

const server = app.listen(port, () => {
  console.log(`Gateway Service listening at http://localhost:${port}`);
});

module.exports = server;