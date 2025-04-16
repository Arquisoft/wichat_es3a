import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Grid, Box, CircularProgress } from '@mui/material';

interface QuestionProps {
    question: Question | null;
    onAnswer: (isCorrect: boolean, selectedAnswer: string) => void;
    isTransitioning: boolean;
    disabled: boolean;
}

interface Question {
    _id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    category: string;
    imageUrl?: string;
}

const Question: React.FC<QuestionProps> = ({ question, onAnswer, isTransitioning, disabled }) => {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    const handleButtonClick = (respuestaSeleccionada: string, index: number): void => {
        if (selectedOption !== null || isTransitioning) return;

        if (disabled) return;

        setSelectedOption(index);

        const isCorrect = respuestaSeleccionada === question?.correctAnswer;
        onAnswer(isCorrect, respuestaSeleccionada);


    };

    useEffect(() => {
        setSelectedOption(null);
    }, [question]);

    if (!question) {
        return <CircularProgress />;
    }

    return (
        <Container id="question-container" maxWidth="lg" >
            <Box id="question-image-container" display="flex" justifyContent="center" sx={{ mb: 2}}>
                {question.imageUrl && (
                    <img  id="question-image"
                        src={question.imageUrl} 
                        alt="Imagen" 
                        style={{ 
                            width: '500px',
                            aspectRatio: '3/2',  
                            borderRadius: '8px', 
                            objectFit: 'cover',   
                        }} 
                        loading="lazy"
                    />
                )}
            </Box>
            <Typography id="question-text" component="h1" variant="h5" sx={{ textAlign: 'center', color: '#F7FFF7' }}>
                {question.question}
            </Typography>
            <Grid id="options-grid" container spacing={2} justifyContent="center">
                {question.options.map((respuesta, index) => (
                    <Grid id={`option-${index}-container`} item xs={6} key={index}>
                        <Button id={`option-${index}-button`}
                            variant="contained"
                            color={
                                selectedOption !== null ?
                                    respuesta === question.correctAnswer
                                        ? 'success' : index === selectedOption
                                            ? 'error' : 'primary' :
                                    isTransitioning ? respuesta === question.correctAnswer ? 'success' : 'primary'
                                        : 'primary'
                            }
                            disabled={isTransitioning && !(respuesta === question.correctAnswer || index === selectedOption)}
                            onClick={() => handleButtonClick(respuesta, index)}
                            sx={{
                                margin: '8px',
                                textTransform: 'none',
                                width: '100%',
                                // Estilos base que se aplicarán siempre
                                '&.MuiButton-contained': {
                                    backgroundColor: '#F7B801',
                                    color: '#202A25'
                                },
                                // Sobreescribir colores para los diferentes estados
                                '&.MuiButton-containedPrimary': {
                                    backgroundColor: '#F7B801',
                                    color: '#202A25'
                                },
                                '&.MuiButton-containedSuccess': {
                                    backgroundColor: '#4CAF50', // Verde para éxito
                                    color: 'white'
                                },
                                '&.MuiButton-containedError': {
                                    backgroundColor: '#F44336', // Rojo para error
                                    color: 'white'
                                },
                                // Estilo para estado disabled
                                '&.Mui-disabled': {
                                    backgroundColor: '#e0e0e0',
                                    color: '#9e9e9e'
                                }
                            }}
                        >
                            {respuesta}
                        </Button>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Question;