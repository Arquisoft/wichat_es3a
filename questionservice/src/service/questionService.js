const express = require('express');
const dataService = require('./questionSaverService');
const generateService = require('./questionGeneratorService');
const app = express();
const port = 8004;

const MIN_QUESTIONS = 10; // Mínimo de preguntas requeridas para una partida
const GENERATE_BATCH = 15; // Generamos más para tener margen
const WAIT_TIMEOUT_MS = 30000; // Tiempo máximo de espera en ms (30 segundos)
const POLL_INTERVAL_MS = 3000; // Intervalo de consulta (3 segundos)

// Middleware para parsear JSON en el cuerpo de la solicitud
app.use(express.json());

/**
 * Función que espera hasta maxWaitMs milisegundos a que aparezca una pregunta para la categoría dada.
 * Consulta la BBDD cada pollIntervalMs milisegundos.
 */
const waitForQuestion = async (category, maxWaitMs = WAIT_TIMEOUT_MS, pollIntervalMs = POLL_INTERVAL_MS) => {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    const question = await dataService.getRandomQuestionByCategory(category);
    if (question) {
      await dataService.deleteQuestionById(question._id);
      return question;
    }
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }
  return null;
};

app.get('/questions/:category', async (req, res) => {
  try {
    console.log(`Question service - Solicitud para categoría: ${req.params.category}`);
    const category = req.params.category;

    // Validar que la categoría sea válida
    const validCategories = ["country", "history", "science", "sports", "animals", "art"];
    if (!validCategories.includes(category)) {
      console.error(`Categoría no válida solicitada: ${category}`);
      return res.status(400).json({ message: `Categoría no válida: ${category}` });
    }

    // Verificar cuántas preguntas tenemos disponibles
    let numberQuestions = await dataService.getNumberQuestionsByCategory(category);
    console.log(`Número de preguntas para ${category}: ${numberQuestions}`);

    // Si hay menos de las requeridas, generar más
    if (numberQuestions < MIN_QUESTIONS) {
      // Si ya está en proceso de generación para esta categoría, se espera
      if (generateService.isGenerating(category)) {
        console.log(`Generación en progreso para ${category}, esperando que aparezca alguna pregunta...`);
        const question = await waitForQuestion(category);
        if (question) {
          return res.json(question);
        }
        return res.status(503).json({
          message: `Generando preguntas para ${category}, intente nuevamente en unos momentos`
        });
      }

      // Iniciar generación asíncrona si no está ya en proceso
      console.log(`Iniciando generación para categoría: ${category}`);
      try {
        const requiredQuestions = MIN_QUESTIONS - numberQuestions;
        generateService.generateQuestionsByCategory(
          category,
          Math.max(requiredQuestions, GENERATE_BATCH)
        )
          .then((count) => {
            console.log(`Generación completada para ${category}: ${count} preguntas generadas`);
          })
          .catch(error => {
            console.error(`Error en generación para ${category}:`, error);
          });
        
        // Esperamos hasta 30 segundos a que aparezca alguna pregunta
        const question = await waitForQuestion(category);
        if (question) {
          return res.json(question);
        }
        return res.status(503).json({
          message: `Generando preguntas para ${category}, por favor intente nuevamente en unos momentos`
        });
      } catch (genError) {
        console.error(`Error iniciando generación para ${category}:`, genError);
        return res.status(500).json({
          message: `Error generando preguntas para ${category}, por favor intente más tarde`
        });
      }
    }

    // Si hay suficientes preguntas, retornar una al azar y borrarla de la BBDD
    const question = await dataService.getRandomQuestionByCategory(category);
    if (question) {
      await dataService.deleteQuestionById(question._id);
      return res.json(question);
    } else {
      return res.status(404).json({
        message: `No se encontraron preguntas para ${category}`
      });
    }
  } catch (error) {
    console.error("Error en la petición:", error);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Endpoint para verificar el estado del servicio
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'question-service',
    timestamp: new Date().toISOString()
  });
});

const server = app.listen(port, () => {
  console.log(`Question Service listening at http://localhost:${port}`);
});

module.exports = server;