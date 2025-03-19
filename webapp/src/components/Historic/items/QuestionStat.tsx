import React from "react";
import { Box, Paper, Typography } from "@mui/material";

interface QuestionStatProps {
    question: Question;
}

interface Question {
    question: string;
    options: string[];
    correctAnswer: string;
    answer: string;
    imageUrl?: string;
    time: number;
}

const QuestionStat: React.FC<QuestionStatProps> = ({ question }) => {
    const isCorrect = question.correctAnswer === question.answer;

    return (
        <Paper
            elevation={3}
            sx={{
                mt: 1,
                padding: "20px",
                textAlign: "left",
                width: "60%",
                borderRadius: "10px",
                backgroundColor: "#F4F4F4",
            }}
        >
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                {question.question}
            </Typography>
            <Typography variant="body1">
                <b>Tiempo:</b> {question.time} segundos
            </Typography>
            {question.options.map((opt, index) => {
                // Definir el color de la opción
                let color = "black"; // Opción por defecto en negro
                if (opt === question.correctAnswer) {
                    color = "#4CAF50"; // Verde para la respuesta correcta
                } else if (opt === question.answer && opt !== question.correctAnswer) {
                    color = "#F44336"; // Rojo para la respuesta seleccionada pero incorrecta
                }

                return (
                    <Typography
                        key={index}
                        variant="body1"
                        sx={{ color: color, mb: 1 }} // Usar el color calculado
                    >
                        {opt}
                    </Typography>
                );
            })}
        </Paper>
    );
};

export default QuestionStat;
