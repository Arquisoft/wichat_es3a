import React, { useEffect, useState } from "react";
import NavBar from "../Main/items/NavBar";
import { Box, Button, CircularProgress, Paper, Typography } from "@mui/material";
import QuestionStat from "./items/QuestionStat";
import axios from "axios";
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '1.2rem', // La fuente pixel suele necesitar un tamaño más pequeño
      letterSpacing: '0.05em'
    }
  },
});

interface HistoricProps {
    username: string;
}

interface Question {
    question: string;
    options: string[];
    correctAnswer: string;
    answer: string;
    imageUrl?: string;
    time: number;
}

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const Historic: React.FC = () => {
    const user: string = localStorage.getItem("username") || "Usuario";
    const username: string = user === "Usuario" ? "Usuario" : user.slice(1, user.length - 1);
    const [stats, setStats] = useState({
        timePlayed: 0,
        gamesPlayed: 0,
        correctAnswered: 0,
        incorrectAnswered: 0,
        puntuation: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            const storedUsername = localStorage.getItem("username");
            const username = storedUsername ? JSON.parse(storedUsername) : "";
            try {
                const response = await axios.get(`${apiEndpoint}/stats/${username}`);
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching stats, intentando crear ranking:", error);
                try {
                    const createResponse = await axios.post(`${apiEndpoint}/stats`, { username });
                    setStats(createResponse.data);
                } catch (createError) {
                    console.error("Error creando ranking:", createError);
                }
            }
        };

        fetchStats();
    }, []);
  const [questions, setQuestions] = useState<Question[]>([]);

    return (
        <ThemeProvider theme={theme}>
            <Box 
                sx={{
                    backgroundColor: '#202A25',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <NavBar />
                <Box 
                    display='flex' 
                    flexDirection='column' 
                    justifyContent="flex-start" 
                    alignItems="center"
                    sx={{
                        flex: 1,
                        width: '100%',
                        padding: 2,
                        paddingTop: 4,
                        paddingBottom: 4
                    }}
                >
                    {/* 🔹 Sección de estadísticas */}
                    <Paper 
                        elevation={3} 
                        sx={{
                            padding: "20px",
                            textAlign: "center",
                            width: "100%",
                            maxWidth: "600px",
                            borderRadius: "10px",
                            backgroundColor: "#F7FFF7",
                            marginBottom: 4
                        }}
                    >
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                fontWeight: "bold", 
                                mb: 2,
                                textShadow: '2px 2px 0 rgba(0,0,0,0.2)',
                                color: '#2c3e50'
                            }}
                        >
                            📊 Estadísticas
                        </Typography>
                        <Typography variant="body1">
                            <b>Tiempo Jugado:</b> {stats.timePlayed} segundos
                        </Typography>
                        <Typography variant="body1">
                            <b>Partidas Jugadas:</b> {stats.gamesPlayed}
                        </Typography>
                        <Typography variant="body1">
                            <b>Puntuacion total:</b> {stats.puntuation}
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#4CAF50" }}>
                            <b>Preguntas acertadas:</b> {stats.correctAnswered}
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#F44336" }}>
                            <b>Preguntas falladas:</b> {stats.incorrectAnswered}
                        </Typography>
                    </Paper>
                    
                    {/* Contenedor para la lista de preguntas */}
                    <Box 
                        sx={{
                            width: '100%',
                            maxWidth: '600px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                        }}
                    >
                        {questions.length > 0 ? (
                            questions.map((q, index) => (
                                <QuestionStat key={index} question={q} />
                            ))
                        ) : (
                            <Paper 
                                elevation={2} 
                                sx={{
                                    padding: "15px",
                                    textAlign: "center",
                                    backgroundColor: "#F0F4F8",
                                    borderRadius: "10px"
                                }}
                            >
                                <Typography variant="body1" color="textSecondary">
                                    No hay historial de preguntas disponible
                                </Typography>
                            </Paper>
                        )}
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default Historic;