import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Typography,
  Button,
  Box,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
// @ts-ignore
import Question from "./Question/Question";
import NavBar from "../Main/items/NavBar";
import LLMChat from './LLMChat';  
import PauseIcon from '@mui/icons-material/Pause'; 

interface Question {
  _id: string; // Added _id property to match the required type
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  imageUrl?: string;
}

// Actualizada la interfaz para incluir si se usó pista
interface RoundResult {
  round: number;
  correct: boolean;
  timeTaken: number;
  roundScore: number;
  usedClue?: boolean; // Nueva propiedad opcional para rastrear si se usó pista
}

const Game: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    username = "Usuario",
    totalQuestions = 10,
    timeLimit = 180,
    themes = {}
  } = location.state || {};

  const totalQuestionsFixed = isNaN(totalQuestions) ? 10 : totalQuestions;
  const timeLimitFixed = isNaN(timeLimit) || timeLimit <= 0 ? 180 : timeLimit;
  const TOTAL_ROUNDS = totalQuestionsFixed;
  const TRANSITION_ROUND_TIME = 3;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [clueOpen, setClueOpen] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [timer, setTimer] = useState<number>(timeLimitFixed);
  const [finished, setFinished] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [numCorrect, setNumCorrect] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [transitionTimer, setTransitionTimer] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [nextQuestion, setNextQuestion] = useState<Question | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [guessed, setGuessed] = useState<boolean>(false);
  const [isPauseIconVisible, setIsPauseIconVisible] = useState<boolean>(true);
  const [clueUsed, setClueUsed] = useState<boolean>(false); // Nuevo estado para rastrear si se usó una pista
  const [showScoreAlert, setShowScoreAlert] = useState<boolean>(false); // Para mostrar alerta cuando se usa una pista
  

  const apiEndpoint: string = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve();
      img.onerror = () => reject();
    });
  };

  const fetchQuestion = async (): Promise<Question | null> => {
    try{
      const gameMode = location.state?.gameMode || "country";
      console.log("petición de preguntas");
      const response = await axios.get(`${apiEndpoint}/questions/${gameMode}`);
      const question = response.data;

      if (question! && question.imageUrl){
        await preloadImage(question.imageUrl);
      }
      return question;
    } catch (error) {
      console.error("Error fetching question:", error);
      setFetchError(true);
      setIsLoading(false);
      setErrorMessage("No se pudieron cargar preguntas para esta categoría.");
      return null;
    }
  }
  
  const handleTimeRemaining = (): string => {
    const remaining = isPaused ? transitionTimer : timer;
    const secsR = remaining % 60;
    let secsRStr = secsR < 10 ? '0' + secsR.toString() : secsR.toString();
    secsRStr = secsRStr !== '00' ? secsRStr : '  ';
    return `${secsRStr}`;
  };

  const handleClueToggle = () => {
    // Si estamos abriendo el chat de pistas, pausamos el temporizador
    if (!clueOpen) {
      setIsPaused(true);
    } 
    // Si estamos cerrando el chat de pistas y no estábamos en transición, reanudamos el temporizador
    else if (!isTransitioning && !guessed) {
      setIsPaused(false);
    }
    
    // Alternamos el estado del chat de pistas
    setClueOpen(!clueOpen);
  };

  // Función para manejar cuando se usa una pista
  const handleClueUsed = () => {
    setClueUsed(true);
    setShowScoreAlert(true);
  };

  const handleNextRound = async (answeredCorrectly: boolean) => {
    let upcomingQuestion: Question | null;
    const currentTimer = timer;
    const roundTimeTaken = timeLimitFixed - currentTimer;

    if (currentQuestion?._id === nextQuestion?._id) {
      let next = await fetchQuestion();
      upcomingQuestion = next;
    } else{
      if (nextQuestion) {
        upcomingQuestion = nextQuestion;
      } else {
        setIsLoading(true);
        upcomingQuestion = await fetchQuestion();
        setIsLoading(false);
      }
    }
  
    fetchQuestion().then(setNextQuestion);

    let multiplier = 1;
    if (timeLimitFixed === 20) multiplier = 1.5;
    else if (timeLimitFixed === 10) multiplier = 2;

    // Calculamos la puntuación base
    let baseScore = answeredCorrectly ? (currentTimer / timeLimitFixed) * 100 : 0;

    // Si se usó una pista, reducimos la puntuación a la mitad
    if (clueUsed) {
      baseScore = baseScore / 2;
    }

    const roundScore = Math.round(baseScore * multiplier);

    if (answeredCorrectly) {
      setNumCorrect(prev => prev + 1);
    }
    setScore(prev => prev + roundScore);

    const roundNumber = roundResults.length + 1;
    // Actualizado para incluir si se usó pista
    const roundResult: RoundResult = {
      round: roundNumber,
      correct: answeredCorrectly,
      timeTaken: roundTimeTaken,
      roundScore: roundScore,
      usedClue: clueUsed // Guardamos si se usó una pista en esta ronda
    };

    setRoundResults(prev => [...prev, roundResult]);

    try {
      await axios.post(`${apiEndpoint}/historic/addQuestion`, {
        user: username,
        question: currentQuestion?.question,
        options: currentQuestion?.options,
        correctAnswer: currentQuestion?.correctAnswer,
        category: currentQuestion?.category,
        answer: selectedAnswer,
        time: roundTimeTaken,
      });
    } catch (error) {
      console.error("Error al guardar en el historial:", error);
    }

    setGuessed(false);
    // Reiniciamos el estado de clueUsed para la siguiente ronda
    setClueUsed(false);

    setIsTransitioning(true);
    setTransitionTimer(TRANSITION_ROUND_TIME);

    const transitionInterval = setInterval(() => {
      setTransitionTimer(prev => {
        if (prev > 1) return prev - 1;
        clearInterval(transitionInterval);
        if (round < TOTAL_ROUNDS) {
          setRound(prev => prev + 1);
          setTimer(timeLimitFixed);
          setIsPaused(false);
          setCurrentQuestion(upcomingQuestion);
        } else {
          setFinished(true);
        }
        setIsTransitioning(false);
        return 0;
      });
    }, 1000);

    const visibilityInterval = setInterval(() => {
      setIsVisible(prev => !prev);
    }, 500);
    setTimeout(() => {
      clearInterval(visibilityInterval);
      setIsVisible(true);
    }, TRANSITION_ROUND_TIME * 1000);
  };

  const handleAnswer = (isCorrect: boolean, selectedAnswer: string) => {
    setIsPaused(true);
    setSelectedAnswer(selectedAnswer);
    setIsCorrectAnswer(isCorrect);
    setGuessed(true);
    const answeredCorrectly = isCorrect;

    setTimeout(() => {
      handleNextRound(answeredCorrectly);
    }, 2000);
  };

  useEffect(() => {
    const setupInitialQuestions = async () => {
      setIsLoading(true);
      const first = await fetchQuestion();
      const second = await fetchQuestion();
      if (first) setCurrentQuestion(first);
      if (second) setNextQuestion(second);
      setIsLoading(false);
    };
  
    setupInitialQuestions();
  }, []);

  // Efecto para manejar la intermitencia del icono de pausa
  useEffect(() => {
    let pauseIconInterval: NodeJS.Timeout;
    
    if (isPaused && clueOpen && !isTransitioning) {
      pauseIconInterval = setInterval(() => {
        setIsPauseIconVisible(prev => !prev);
      }, 500);
    }
    
    return () => {
      if (pauseIconInterval) clearInterval(pauseIconInterval);
    };
  }, [isPaused, clueOpen, isTransitioning]);

  useEffect(() => {
    // Solo decrementamos el temporizador si:
    // 1. No está pausado
    // 2. No estamos cargando
    // 3. El chat de pistas NO está abierto
    if (!isPaused && !isLoading && !clueOpen) {
      const interval = setInterval(() => {
        if (timer > 0) {
          setTimer(prev => prev - 1);
        } else {
          setIsPaused(true);
          handleNextRound(false);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, isPaused, isLoading, clueOpen]); // Agregamos clueOpen como dependencia

  useEffect(() => {
    if (finished && round >= TOTAL_ROUNDS) {
      navigate('/endGame', {
        state: {
          score,
          numCorrect,
          username,
          totalQuestions,
          timeLimit,
          themes,
          roundResults
        }
      });
    }
  }, [finished, navigate, score, numCorrect, username, totalQuestions, timeLimit, themes, roundResults]);

  return (
    <Box id="game-container" component="main" sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      backgroundColor: '#202A25',
    }}>
      <Box id="navbar-container" sx={{ width: "100%", position: "absolute", top: 0, left: 0 }}>
        <NavBar />
      </Box>
      {isLoading ? (
        <Box id="loading-container" display="flex" alignItems="center" flexDirection="column">
          <Typography id="loading-text" variant="h6" color="#F7FFF7" sx={{ mb: 2 }}>
            Cargando pregunta...
          </Typography>
          <CircularProgress id="loading-spinner" sx={{ color: '#F7B801' }} />
        </Box>
      ) : fetchError ? (
        <Box id="error-container" display="flex" alignItems="center" flexDirection="column" sx={{ p: 4, backgroundColor: '#5f4bb6', borderRadius: 2 }}>
          <Typography id="error-title" variant="h6" color="#F7FFF7" sx={{ mb: 2 }}>
            No se pudieron cargar preguntas para esta categoría.
          </Typography>
          <Typography id="error-message" variant="body1" color="#F7FFF7" sx={{ mb: 3 }}>
            Por favor, inténtalo de nuevo más tarde o selecciona otra categoría.
          </Typography>
          <Button id="return-button"
            variant="contained" 
            onClick={() => navigate('/main')}
            sx={{
              backgroundColor: "#F7B801",
              color: "#202A25",
              '&:hover': {
                backgroundColor: "#EDC9FF",
              }
            }}
          >
            Volver al Menú Principal
          </Button>
        </Box>
      ) : (
        <Box id="game-content-container" display='flex' flexDirection='row' p={1} bgcolor='gray.100' borderRadius={2} boxShadow={3} sx={{
          transform: 'scale(0.80)',
          transformOrigin: 'center',
          backgroundColor: '#5f4bb6'
        }}>
          <Box id="question-section" display='flex' flexDirection='column' justifyContent="center" alignItems="center">
            <Typography sx = {{ color: '#F7B801', gap: 50, fontSize: 32}}><strong>Ronda: {round}</strong></Typography>
            <Box id="timer-container" display="flex" justifyContent="center" alignItems="center" position="relative" mt={3} mb={3} >
              <CircularProgress id="timer-circle"
                variant="determinate"
                value={isPaused ? (transitionTimer / TRANSITION_ROUND_TIME) * 100 : (timer / timeLimitFixed) * 100}
                size={80}
                sx={{ color: '#F7B801'}}
              />
              {isVisible && (
                <Typography id="timer-text"
                  variant="h6"
                  sx={{
                    position: "absolute",
                    fontWeight: "bold",
                    color: clueUsed ? 'orange' : '#F7FFF7', // Cambiamos el color si se usó una pista
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  {(isPaused && clueOpen && !isTransitioning) ? 
                    (<Box sx={{
                      bgcolor: '#F7FFF7',
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {isPauseIconVisible && <PauseIcon fontSize="medium" sx={{ color: '#5f4bb6' }} />}
                    </Box>) :
                    handleTimeRemaining()}
                </Typography>
              )}
            </Box>
            {currentQuestion && (
              <Question question={currentQuestion} onAnswer={handleAnswer} isTransitioning={isTransitioning} disabled={clueOpen} />
            )}
            <Box id="clue-button-container" display="flex" justifyContent="center" mt={3}>
              <Button id="clue-button"
                variant="contained" 
                color="secondary" 
                size="large" 
                onClick={handleClueToggle}
              >
                {clueOpen ? "Cerrar Pista" : "Pedir Pista"}
              </Button>
            </Box>
          </Box>
          {clueOpen && (
            <LLMChat
              question={currentQuestion?.question || ""}
              solution={currentQuestion?.correctAnswer || ""}
              options={currentQuestion?.options || []}
              onClueUsed={handleClueUsed}
            />
          )}
        </Box>
      )}
      
      {/* Alerta que aparece cuando se usa una pista */}
      <Snackbar id="clue-penalty-alert"
        open={showScoreAlert} 
        autoHideDuration={3000} 
        onClose={() => setShowScoreAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert id="clue-penalty-message"
          onClose={() => setShowScoreAlert(false)} 
          severity="warning" 
          sx={{ width: '100%' }}
        >
          Multa por uso de IA: puntuación de esta ronda reducida a la mitad.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Game;