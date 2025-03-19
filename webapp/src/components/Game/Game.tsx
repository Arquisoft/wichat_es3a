import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import axios from 'axios';
import {
    Container,
    Typography,
    Button,
    Snackbar,
    Grid,
    List,
    ListItem,
    ListItemText,
    Box,
    CircularProgress,
    TextField, IconButton
} from '@mui/material';
import cryptoRandomString from 'crypto-random-string';
// @ts-ignore
import Question from "./Question/Question";
import NavBar from "../Main/items/NavBar";
import SendIcon from '@mui/icons-material/Send';

interface GameProps {
    username: string;
    totalQuestions: number;
    timeLimit: number;
    themes: { [key: string]: boolean };
}

interface Question {
    question: string;
    options: string[];
    correctAnswer: string;
    category: string;
    imageUrl?: string;
}

const Game: React.FC<GameProps> = ({ username, totalQuestions, timeLimit, themes }) => {
    // Si las props numéricas no son válidas se asignan valores por defecto
    const totalQuestionsFixed = isNaN(totalQuestions) ? 10 : totalQuestions;
    const timeLimitFixed = isNaN(timeLimit) || timeLimit <= 0 ? 180 : timeLimit;
    const TOTAL_ROUNDS = totalQuestionsFixed;
    const TRANSITION_ROUND_TIME = 3; // 3 segundos de pausa antes de la siguiente ronda
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [clueOpen, setClueOpen] = useState<boolean>(true);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);    const [timer, setTimer] = useState<number>(timeLimitFixed); // Inicializar con el tiempo límite
    const [numberClics, setNumberClics] = useState<number>(0);
    const [finished, setFinished] = useState<boolean>(false);
    const [almacenado, setAlmacenado] = useState<boolean>(false);
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(1);
    const [isPaused, setIsPaused] = useState<boolean>(false); // Nuevo estado para pausar el temporizador
    const [transitionTimer, setTransitionTimer] = useState<number>(0); // Estado para manejar el tiempo de transición
    const [isVisible, setIsVisible] = useState<boolean>(true); // Estado para manejar la visibilidad del tiempo
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null); // Estado para la pregunta actual
    const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");

    const location = useLocation();
    const navigate = useNavigate();

    const apiEndpoint: string = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

    const fetchQuestion = async () => {
        try {
            const response = await axios.get(`${apiEndpoint}/questions/country`);
            setCurrentQuestion(response.data);
            setIsLoading(false); // Actualizar el estado a false cuando se carguen las preguntas
        } catch (error) {
            console.error("Error fetching question:", error);
        }
    };

    const handleTimeRemaining = (): string => {
        const remaining = isPaused ? transitionTimer : timer;
        const minsR = Math.floor(remaining / 60);
        const secsR = remaining % 60;
        const secsRStr = secsR < 10 ? '0' + secsR.toString() : secsR.toString();
        return `${secsRStr}`;
    };

    const handleNextRound = () => {
    setIsTransitioning(true); // Iniciar la transición
    setTransitionTimer(TRANSITION_ROUND_TIME);
    const transitionInterval = setInterval(() => {
        setTransitionTimer(prev => {
            if (prev > 1) {
                return prev - 1;
            } else {
                clearInterval(transitionInterval);
                if (round < TOTAL_ROUNDS) {
                    setRound(prevRound => prevRound + 1);
                    setTimer(timeLimitFixed); // Reiniciar el temporizador
                    setIsPaused(false); // Reanudar el temporizador
                    fetchQuestion(); // Obtener una nueva pregunta
                } else {
                    setFinished(true);
                }
                setIsTransitioning(false); // Finalizar la transición
                return 0;
            }
        });
    }, 1000);

    // Alternar la visibilidad del tiempo cada 500 ms
    const visibilityInterval = setInterval(() => {
        setIsVisible(prev => !prev);
    }, 500);

    setTimeout(() => {
        clearInterval(visibilityInterval);
        setIsVisible(true); // Asegurarse de que el tiempo sea visible al final de la transición
    }, TRANSITION_ROUND_TIME * 1000);
};

const handleAnswer = (isCorrect: boolean, selectedAnswer: string) => {
    setIsPaused(true); // Pausar el temporizador
    setSelectedAnswer(selectedAnswer);
    setIsCorrectAnswer(isCorrect);
    if (isCorrect) {
        setScore(prevScore => prevScore + 1);
    }
    setTimeout(() => {
        handleNextRound();
    }, 2000); // Esperar 2 segundos antes de pasar a la siguiente ronda
};

    useEffect(() => {
        fetchQuestion(); // Obtener la primera pregunta al cargar el componente
    }, []);

    useEffect(() => {
        if (!isPaused && !isLoading) {
            const interval = setInterval(() => {
                if (timer > 0) {
                    setTimer(prevTimer => prevTimer - 1);
                } else {
                    setIsPaused(true); // Pausar el temporizador
                    handleNextRound();
                }
            }, 1000);
    
            return () => clearInterval(interval);
        }
    }, [timer, isPaused, isLoading]);

    useEffect(() => {
        if (finished && round >= TOTAL_ROUNDS) {
            navigate('/endGame', { state: { score, username, totalQuestions, timeLimit, themes } });
        }
    }, [finished, navigate, score, username, totalQuestions, timeLimit, themes, round]);

    interface Message {
        text: string;
        sender: 'user' | 'system';
    }

    const handleSendMessage = (): void => {
        if (newMessage.trim() !== "") {
            // Agregar el mensaje del usuario a la conversación
            setMessages((prevMessages: Message[]) => [
                ...prevMessages,
                { text: newMessage, sender: 'user' }
            ]);

            // Simular el envío de una pista por parte del sistema
            setTimeout(() => {
                setMessages((prevMessages: Message[]) => [
                    ...prevMessages,
                    { text: 'Esta es tu pista de ayuda.', sender: 'system' }
                ]);
            }, 1000);

            setNewMessage("");
        }
    };

    return (
        <Box component="main" sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
        }}>
            <Box sx={{ width: "100%", position: "absolute", top: 0, left: 0 }}>
                <NavBar />
            </Box>
    
            {isLoading ? (
                <Box display="flex" alignItems="center">
                <Typography variant="h6" color="textSecondary" sx={{ mr: 2 }}>
                    Cargando...
                </Typography>
                <CircularProgress />
            </Box>
            ) : (
                <Box display='flex' flexDirection='row' p={2} bgcolor='gray.100' borderRadius={2} boxShadow={3}>
                    <Box display='flex' flexDirection='column' justifyContent="center" alignItems="center">
                    <Box display="flex" justifyContent="center" alignItems="center" position="relative" mt={10} mb={3}>
                        <CircularProgress variant="determinate" value={isPaused ? (transitionTimer / TRANSITION_ROUND_TIME) * 100 : (timer / timeLimitFixed) * 100} size={80} />
                        {isVisible && (
                            <Typography 
                                variant="h6" 
                                sx={{
                                    position: "absolute",
                                    fontWeight: "bold",
                                    color: 'black',
                                }}
                            >
                                {handleTimeRemaining()}
                            </Typography>
                        )}
                    </Box>
                    <Question question={currentQuestion} onAnswer={handleAnswer} isTransitioning={isTransitioning} />                    <Box display="flex" justifyContent="center" mt={3}>
                        <Button variant="contained" color="secondary" size="large" onClick={() => setClueOpen(!clueOpen)}>
                            Pedir Pista
                        </Button>
                    </Box>
                    </Box>
                    {clueOpen ? (
                         <Box>

                         </Box>) :
                        (<Box
                                sx={{
                                    mt: 3,
                                    maxHeight: 300,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    bgcolor: 'white',
                                    borderRadius: 2,
                                    boxShadow: 3,
                                    p: 2,
                                    width: '100%',
                                    margin: 2
                                }}
                            >
                                {/* Lista de mensajes del chat */}
                                <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
                                    {messages.map((message, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                                                mb: 1,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    bgcolor: message.sender === 'user' ? 'blue.200' : 'gray.300',
                                                    color: 'black',
                                                    p: 1,
                                                    borderRadius: 1,
                                                }}
                                            >
                                                {message.text}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>

                                {/* Input para escribir mensajes */}
                                <Box display="flex">
                                    <TextField
                                        fullWidth
                                        placeholder="Escribe tu mensaje..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <IconButton color="primary" onClick={handleSendMessage}>
                                        <SendIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        )}
                </Box>
            )}
        </Box>
    );
};

export default Game;