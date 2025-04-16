const express = require('express');
const dataService = require('./questionSaverService');
const generateService = require('./questionGeneratorService');
const app = express();
const port = 8004;

const MIN_QUESTIONS = 5; // Reducido para facilitar el inicio rápido
const GENERATE_BATCH = 15;

// Middleware to parse JSON in request body
app.use(express.json());

app.get('/questions/:category', async (req, res) => {
    try{
        console.log("Question service: " + req.params.category);
        const category = req.params.category;
        const numberQuestions = await dataService.getNumberQuestionsByCategory(category);
        console.log("Numero de preguntas " + numberQuestions + " category " + category);
        if(numberQuestions < MIN_QUESTIONS){
            console.log("Generando preguntas...");
            await generateService.generateQuestionsByCategory(category, GENERATE_BATCH);
            console.log("Preguntas generadas correctamente");
        }
        const question = await dataService.getRandomQuestionByCategory(category);
        console.log("Pregunta generada: " + question);
        if (!question) {
            return res.status(404).json({ message: "There are no more questions available." });
        }
        await dataService.deleteQuestionById(question._id);

        res.json(question);
    } catch (error) {
        console.log("Error en la petición:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/initializeQuestionsDB', async (req, res) => {
    try{
        const categories = req.body.categories || [];
        if (categories.length === 0) {
            return res.status(400).json({ error: 'No categories provided' });
        }
        for (const category of categories) {
            const num = await dataService.getNumberQuestionsByCategory(category);
            console.log("Numero de preguntas " + num + " category " + category);
            if (num < MIN_QUESTIONS) {
                await generateService.generateQuestionsByCategory(category, 10);
            } else {
                console.log(`Ya se está generando para la categoría ${category}`);
            }
        }
        res.status(200).json({ message: 'Questions initialized successfully' });
    } catch(error){

    }
});
// Set to track categories being generated
const generating = new Set();

// Endpoint para obtener todas las preguntas (para depuración)
app.get('/getDBQuestions', async (req, res) => {
    try {
        const questions = await dataService.getAllQuestions();
        res.json(questions);
    } catch (error) {
        console.log("Error en la petición:", error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para obtener preguntas por categoría (sin eliminarlas)
app.get('/viewQuestions/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const questions = await dataService.getQuestionsByCategory(category);
        res.json({
            category,
            count: questions.length,
            questions
        });
    } catch (error) {
        console.log("Error en la petición:", error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para verificar el estado del servicio
app.get('/health', (req, res) => {
    const generatingCategories = Array.from(generating);
    
    res.json({ 
        status: 'ok',
        service: 'question-service',
        generating: generatingCategories,
        timestamp: new Date().toISOString()
    });
});

const server = app.listen(port, () => {
    console.log(`Question Service listening at http://localhost:${port}`);
});

module.exports = server;