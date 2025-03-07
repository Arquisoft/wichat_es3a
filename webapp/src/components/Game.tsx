//La totalidad de este codigo esta basado en el siguiente repositorio:
//https://github.com/Arquisoft/wiq_es6b/blob/master/webapp/src/components/Game.js
//Este codigo ha sido modificado para adaptarse a los requerimientos del proyecto
//Eso incluye su traducción a TypeScript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Button, Snackbar, Grid, List, ListItem, ListItemText } from '@mui/material';
import cryptoRandomString from 'crypto-random-string';

interface GameProps {
  username: string;
  totalQuestions: number;
  timeLimit: number;
  themes: { [key: string]: boolean };
}

interface Question {
  questionBody: string;
  correcta: string;
  incorrectas: string[];
}

const Game: React.FC<GameProps> = ({ username, totalQuestions, timeLimit, themes }) => {
  // Si las props numéricas no son válidas se asignan valores por defecto
  const totalQuestionsFixed = isNaN(totalQuestions) ? 10 : totalQuestions;
  const timeLimitFixed = isNaN(timeLimit) ? 180 : timeLimit;

  const [question, setQuestion] = useState<Question>({
    questionBody: '',
    correcta: '',
    incorrectas: []
  });
  const [respuestasAleatorias, setRespuestasAleatorias] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [correctQuestions, setCorrectQuestions] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [themesSelected, setThemesSelected] = useState<{ [key: string]: boolean }>(themes);
  const [numberClics, setNumberClics] = useState<number>(0);
  const [finished, setFinished] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [almacenado, setAlmacenado] = useState<boolean>(false);

  const pricePerQuestion = 25;
  const delayBeforeNextQuestion = 3000; // 3 segundos de retardo antes de pasar a la siguiente pregunta

  const apiEndpoint: string = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

  function getRandomIndex(length: number): number {
    const randomValue = parseInt(cryptoRandomString({ length: 10, type: 'numeric' }), 10);
    return randomValue % length;
  }

  function randomSort(): number {
    const randomValue = parseInt(cryptoRandomString({ length: 10, type: 'numeric' }), 10);
    return randomValue % 2 === 0 ? 1 : -1;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (timer >= timeLimitFixed) {
        setFinished(true);
      } else if (!finished) {
        setTimer(prevTimer => prevTimer + 1);
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLimitFixed, timer, finished]);

  // Función para obtener una pregunta aleatoria
  const obtenerPreguntaAleatoria = async (): Promise<void> => {
    try {
      const temas = Object.entries(themesSelected)
        .filter(([tema, seleccionado]) => seleccionado)
        .map(([tema]) => tema);
      const randomIndex = getRandomIndex(temas.length);
      const temaAleatorio = temas[randomIndex];

      const response = await axios.get(`${apiEndpoint}/getRandomQuestion${temaAleatorio}`);
      setQuestion(response.data);
      const respuestas: string[] = [...response.data.incorrectas, response.data.correcta];
      setRespuestasAleatorias(respuestas.sort(randomSort).slice(0, 4)); // Mostrar solo 4 respuestas
    } catch (err: any) {
      console.error("Error al obtener la pregunta aleatoria", err);
      setError('Error al obtener la pregunta aleatoria');
    }
  };

  useEffect(() => {
    obtenerPreguntaAleatoria();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiEndpoint, themesSelected]);

  const handleTimeRemaining = (): string => {
    const remaining = timeLimitFixed - timer;
    const minsR = Math.floor(remaining / 60);
    const minsRStr = minsR < 10 ? '0' + minsR.toString() : minsR.toString();
    const secsR = remaining % 60;
    const secsRStr = secsR < 10 ? '0' + secsR.toString() : secsR.toString();
    return `${minsRStr}:${secsRStr}`;
  };

  const handleTimeUsed = (): string => {
    const mins = Math.floor(timer / 60);
    const minsStr = mins < 10 ? '0' + mins.toString() : mins.toString();
    const secs = timer % 60;
    const secsStr = secs < 10 ? '0' + secs.toString() : secs.toString();
    return `${minsStr}:${secsStr}`;
  };

  const addGeneratedQuestionBody = async (): Promise<void> => {
    try {
      await axios.post(`${apiEndpoint}/addGeneratedQuestion`, {
        generatedQuestionBody: question.questionBody,
        correctAnswer: question.correcta
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar la pregunta generada');
    }
  };

  const handleButtonClick = async (respuestaSeleccionada: string, index: number): Promise<void> => {
    if (!finished) {
      if (selectedOption !== null) return; // Si ya se seleccionó una opción, no hacer nada

      setSelectedOption(index); // Guardar la opción seleccionada actualmente

      if (respuestaSeleccionada === question.correcta) {
        setCorrectQuestions(prev => prev + 1);
        setSelectedAnswer('correct');
      } else {
        setSelectedAnswer('incorrect');
      }

      // Si ya llegamos a la última pregunta, acabamos la partida para mostrar el resultado
      if (numberClics === totalQuestionsFixed - 1) {
        setFinished(true);
      }

      // Después de 3 segundos, restablecer la selección y pasar a la siguiente pregunta
      setTimeout(async () => {
        setNumberClics(prev => prev + 1);
        await obtenerPreguntaAleatoria();
        setSelectedOption(null);
        await addGeneratedQuestionBody();
        setSelectedAnswer('');
      }, delayBeforeNextQuestion);
    }
  };

  useEffect(() => {
    const addRecord = async (): Promise<void> => {
      try {
        await axios.post(`${apiEndpoint}/addRecord`, {
          userId: username,
          date: new Date(),
          time: timer,
          money: (pricePerQuestion * correctQuestions),
          correctQuestions: correctQuestions,
          failedQuestions: (totalQuestionsFixed - correctQuestions)
        });
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error al agregar el record');
        if (timeLimitFixed > 15000) {
          setThemesSelected(themes);
        }
      }
    };

    const updateRanking = async (): Promise<void> => {
      try {
        await axios.post(`${apiEndpoint}/updateRanking`, {
          username: username,
          preguntasCorrectas: correctQuestions,
          preguntasFalladas: totalQuestionsFixed - correctQuestions
        });
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error al actualizar el ranking');
      }
    };

    if ((timer >= timeLimitFixed || finished) && !almacenado) {
      (async () => {
        await addRecord();
        await updateRanking();
      })();
      setAlmacenado(true);
    }
  }, [
    timer,
    finished,
    totalQuestionsFixed,
    timeLimitFixed,
    almacenado,
    apiEndpoint,
    correctQuestions,
    username,
    themes,
  ]);

  return (
    <Container maxWidth="lg">
      {(numberClics >= totalQuestionsFixed || timer >= timeLimitFixed) && almacenado ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
            ¡Gracias por jugar!
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary={`Tiempo transcurrido: ${handleTimeUsed()}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`Respuestas correctas: ${correctQuestions}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`Respuestas incorrectas: ${totalQuestionsFixed - correctQuestions}`} />
            </ListItem>
            <ListItem>
              <ListItemText primary={`Dinero recaudado: ${pricePerQuestion * correctQuestions}`} />
            </ListItem>
          </List>
        </div>
      ) : (
        <>
          <Typography component="h1" variant="h5" sx={{ textAlign: 'center' }}>
            Pregunta Número {numberClics + 1} :
          </Typography>
          <Typography
            component="h2"
            sx={{
              textAlign: 'center',
              color: (timeLimitFixed - timer) <= 60 && timer % 2 === 0 ? 'red' : 'inherit',
              fontStyle: 'italic',
              fontWeight: timer > 150 && timer % 2 === 0 ? 'bold' : 'inherit'
            }}
          >
            ¡Tiempo restante {handleTimeRemaining()}!
          </Typography>
          <Typography component="h1" variant="h5" sx={{ textAlign: 'center' }}>
            {question.questionBody}
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {respuestasAleatorias.map((respuesta, index) => (
              <Grid item xs={6} key={index}>
                <Button
                  variant="contained"
                  color={
                    selectedOption !== null
                      ? respuesta === question.correcta
                        ? 'success'
                        : index === selectedOption
                        ? 'error'
                        : 'primary'
                      : 'primary'
                  }
                  onClick={() => handleButtonClick(respuesta, index)}
                  sx={{
                    margin: '8px',
                    textTransform: 'none',
                    width: '100%'
                  }}
                >
                  {respuesta}
                </Button>
              </Grid>
            ))}
          </Grid>
        </>
      )}
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
          message={`Error: ${error}`}
        />
      )}
    </Container>
  );
};

export default Game;
