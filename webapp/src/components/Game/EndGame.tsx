import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Paper, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import axios from 'axios';
import NavBar from "../Main/items/NavBar";

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

interface RoundResult {
  round: number;
  correct: boolean;
  timeTaken: number;
  roundScore: number;
  usedClue?: boolean; 
}

interface EndGameProps {
  username: string;
  totalQuestions: number;
  timeLimit: number;
  themes: { [key: string]: boolean };
  score: number;
  numCorrect: number;
  roundResults: RoundResult[];
}

const EndGame: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    username: rawUsername,
    totalQuestions,
    timeLimit,
    themes,
    score,
    numCorrect,
    roundResults
  } = location.state as EndGameProps;

  const username = typeof rawUsername === 'string' ? rawUsername.replace(/^"|"$/g, '') : rawUsername;

  const handlePlayAgain = () => {
    navigate("/game", {
      state: {
          username,
          totalQuestions: 10,
          timeLimit: timeLimit,
          themes: { geografía: true, historia: false }
      }
  });
  };

  const handleBackToMenu = () => {
    navigate('/main');
  };

  useEffect(() => {
    const calculateAndSendStats = async () => {
      let correctQuestions = parseInt(localStorage.getItem('correctQuestions') || '0');
      let incorrectQuestions = parseInt(localStorage.getItem('incorrectQuestions') || '0');
      let gamesplayed = parseInt(localStorage.getItem('gamesplayed') || '0');
      let secondsPlayed = parseInt(localStorage.getItem('secondsPlayed') || '0');

      const totalTimePlayed = roundResults.reduce((acc: number, round: RoundResult) => acc + round.timeTaken, 0);

      correctQuestions += numCorrect;
      incorrectQuestions += (totalQuestions - numCorrect);
      gamesplayed += 1;
      secondsPlayed += totalTimePlayed;

      localStorage.setItem('correctQuestions', correctQuestions.toString());
      localStorage.setItem('incorrectQuestions', incorrectQuestions.toString());
      localStorage.setItem('gamesplayed', gamesplayed.toString());
      localStorage.setItem('secondsPlayed', secondsPlayed.toString());

      try {
        await axios.post(`${apiEndpoint}/stats`, {
          username: username,
          correctAnswered: numCorrect,
          incorrectAnswered: totalQuestions - numCorrect,
          gamesPlayed: 1,
          timePlayed: totalTimePlayed,
          puntuation: score
        });
      } catch (error) {
        console.error("Error registrando resultados:", error);
      }
    };

    calculateAndSendStats();
  }, [roundResults, numCorrect, score, totalQuestions, username]);

  // Verificar si al menos una ronda tiene penalización
  const hasPenalizedRounds = roundResults.some(round => round.usedClue);

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        padding: '20px',
        backgroundColor: '#202A25'
      }}
    >
      <Box sx={{ width: "100%", position: "absolute", top: 0, left: 0 }}>
        <NavBar />
      </Box>
      <Typography variant="h4" gutterBottom sx={{ mt: 8, color: '#F7FFF7'}}>
        ¡Juego Terminado!
      </Typography>
      <Typography variant="h6" gutterBottom sx = {{ color: '#F7FFF7'}}>
        {username}, tu puntaje total es: {score} puntos.
      </Typography>
      <Typography variant="body1" gutterBottom sx = {{ color: '#F7FFF7'}}>
        Respuestas correctas: {numCorrect} / {totalQuestions}
      </Typography>
      <Paper sx={{ width: '90%', maxWidth: 600, mt: 3, p: 2, backgroundColor: '#5f4bb6' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" sx = {{ color: '#F7FFF7'}}>
            Resumen de la partida
          </Typography>
          
          {/* Leyenda de penalización */}
          {hasPenalizedRounds && (
            <Box display="flex" alignItems="center">
              <Box 
                component="span" 
                sx={{ 
                  display: 'inline-block', 
                  width: '16px', 
                  height: '16px', 
                  bgcolor: 'warning.main', 
                  mr: 1,
                  borderRadius: '2px'
                }} 
              />
              <Typography variant="body2" color="text.secondary" sx = {{ color: '#F7FFF7'}}>
                Puntuación con penalización del 50% por uso de IA
              </Typography>
              <Tooltip title="Cuando se utiliza el chat de pistas, la puntuación de esa ronda se reduce a la mitad" arrow>
                <InfoIcon fontSize="small" sx={{ ml: 0.5, color: 'text.secondary', cursor: 'help' }} />
              </Tooltip>
            </Box>
          )}
        </Box>
        
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx = {{ color: '#F7FFF7'}}><strong>Ronda</strong></TableCell>
              <TableCell sx = {{ color: '#F7FFF7'}}><strong>Resultado</strong></TableCell>
              <TableCell sx = {{ color: '#F7FFF7'}}><strong>Tiempo (s)</strong></TableCell>
              <TableCell sx = {{ color: '#F7FFF7'}}><strong>Puntos</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roundResults.map((round) => (
              <TableRow key={round.round}>
                <TableCell sx = {{ color: '#F7FFF7'}}>Ronda {round.round}</TableCell>
                <TableCell sx = {{ color: '#F7FFF7'}}>{round.correct ? 'Acertada' : 'Fallada'}</TableCell>
                <TableCell sx = {{ color: '#F7FFF7'}}>{round.timeTaken}</TableCell>
                <TableCell 
                  sx={{ 
                    color: round.usedClue ? 'warning.main' : '#F7FFF7',
                    fontWeight: round.usedClue ? 'bold' : 'inherit'
                  }}
                >
                  {round.roundScore}
                  {round.usedClue && (
                    <Tooltip title="Puntuación reducida al 50% por uso de IA" arrow>
                      <InfoIcon fontSize="small" sx={{ ml: 0.5, color: 'warning.main', cursor: 'help' }} />
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Box mt={4} sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" color="primary" onClick={handlePlayAgain}>
          Volver a Jugar
        </Button>
        <Button variant="contained" color="secondary" onClick={handleBackToMenu}>
          Volver al Menú
        </Button>
      </Box>
    </Box>
  );
};

export default EndGame;