const mongoose = require('mongoose');
const Question = require('../model/question')


// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/questiondb';
mongoose.connect(mongoUri);


module.exports = {
    
    getNumberQuestionsByCategory: async function(category){
        try{

            const numberQuestions = await Question.countDocuments({category: category});
            return numberQuestions;

        }catch (error) {
            res.status(500).json({ error: error.message });

        }

    },

    saveQuestion: async function(question){
        try{

            const newQuestion = new Question(question);
            await newQuestion.save();

        }catch (error) {
            res.status(500).json({ error: error.message });

        }
    },

    getExistingImages: async function(category){
        const questions = await QuestionModel.find({ category }, { imageUrl: 1 });
        const urls = new Set(questions.map(q => q.imageUrl));
        return { urls };
    },
    saveQuestionsBatch: async function (questions) {
        if (!Array.isArray(questions) || questions.length === 0) return;
      
        try {
          await Question.insertMany(questions); // usando Mongoose, por ejemplo
          console.log(`${questions.length} preguntas guardadas`);
        } catch (error) {
          console.error("Error guardando preguntas en lote:", error.message);
        }
    },

    /**
     * Deletes a question from the database.
     * @param {id} str - The id of the document to be removed
     */
    deleteQuestionById : async function(id) {
        try {
        await Question.findByIdAndDelete(id);
        console.log(`Question ${id} deleted successfully`);

        } catch (error) {
            console.error('Error deleting question:', error.message);
            return error.message;
        }
    },

    getRandomQuestionByCategory: async function(categoryParam) {
        try {
            const question = await Question.aggregate([
                { $match: { category: categoryParam } },
                { $sample: { size: 1 } } // Select a random document
            ]);
    
            return question.length > 0 ? question[0] : null; 
        } catch (error) {
            console.error("Error fetching random question:", error);
            throw new Error(error.message);
        }
    },
    
    /**
     * Gets all questions from the database.
     * @returns {Promise<Array>} - A promise that resolves to an array of all questions
     */
    getAllQuestions: async function() {
        try {
            const questions = await Question.find({}, { __v: 0 });
            return questions;
        } catch (error) {
            console.error('Error getting all questions:', error);
            throw new Error(error.message);
        }
    }
    
};