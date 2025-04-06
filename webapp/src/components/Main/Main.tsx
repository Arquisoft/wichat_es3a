import { useEffect, useState } from "react";
import { Box, Button, Typography, Paper, Slider, Grid } from "@mui/material";
import NavBar from "./items/NavBar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PublicIcon from '@mui/icons-material/Public';
import HistoryIcon from '@mui/icons-material/History';
import ScienceIcon from '@mui/icons-material/Science';
import MovieIcon from '@mui/icons-material/Movie';
import PetsIcon from '@mui/icons-material/Pets';
import PaletteIcon from '@mui/icons-material/Palette';

const theme = createTheme({
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '2rem',
      letterSpacing: '0.05em'
    },
    button: {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '1.1rem',
    }
  },
});

const Main = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        timePlayed: 0,
        gamesPlayed: 0,
        correctAnswered: 0,
        incorrectAnswered: 0,
        puntuation: 0
    });

    const [difficulty, setDifficulty] = useState<number>(1);
    const [selectedMode, setSelectedMode] = useState<string>("country");
    const isAuthenticated = !!localStorage.getItem("token");

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    const storedUsername = localStorage.getItem('username');
    const username = storedUsername ? JSON.parse(storedUsername) : "Jugador";

    const difficultyMap: Record<number, { label: string; time: number; color: string }> = {
        0: { label: "Fácil", time: 30, color: "#4CAF50" },
        1: { label: "Medio", time: 20, color: "#FFA726" },
        2: { label: "Difícil", time: 10, color: "#EF5350" },
    };

    const gameModes = [
        { value: "country", label: "Geografía", icon: <PublicIcon fontSize="medium" /> },
        { value: "history", label: "Historia", icon: <HistoryIcon fontSize="medium" /> },
        { value: "science", label: "Ciencia", icon: <ScienceIcon fontSize="medium" /> },
        { value: "sports", label: "Deportes", icon: <MovieIcon fontSize="medium" /> },
        { value: "animals", label: "Animales", icon: <PetsIcon fontSize="medium" /> },
        { value: "art", label: "Arte", icon: <PaletteIcon fontSize="medium" /> },
    ];

    const handleButtonClick = () => {
        const selected = difficultyMap[difficulty];
        
        navigate("/game", {
            state: {
                username,
                totalQuestions: 10,
                timeLimit: selected.time,
                gameMode: selectedMode
            }
        });
    };

    return (
        <Box component="main"
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#202A25",
                padding: "0 16px 32px 16px"
            }}
        >
            <Box sx={{ width: "100%", position: "absolute", top: 0, left: 0 }}>
                <NavBar />
            </Box>

            <Box sx={{ textAlign: "center", mt: 12, width: "100%", maxWidth: "800px" }}>
                <Typography variant="h4" sx={{ color: '#F7FFF7', fontWeight: "bold", mb: 3 }}>
                    {username}, ¿Listo para jugar?
                </Typography>

                {/* Selector de modo de juego */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: "10px", backgroundColor: '#F7FFF7' }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", color: "#5f4bb6" }}>
                        Selecciona un modo de juego
                    </Typography>
                    
                    <Grid container spacing={1}>
                        {gameModes.map((mode) => (
                            <Grid item xs={6} sm={4} key={mode.value}>
                                <Paper 
                                    elevation={2}
                                    onClick={() => setSelectedMode(mode.value)}
                                    sx={{
                                        p: 1.5,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        borderRadius: '8px',
                                        border: mode.value === selectedMode ? '2px solid #5f4bb6' : '2px solid transparent',
                                        backgroundColor: mode.value === selectedMode ? 'rgba(95, 75, 182, 0.1)' : 'white',
                                        '&:hover': {
                                            transform: 'translateY(-3px)',
                                            boxShadow: '0 5px 10px rgba(0,0,0,0.1)',
                                        }
                                    }}
                                >
                                    <Box sx={{ 
                                        color: '#5f4bb6',
                                        backgroundColor: 'rgba(95, 75, 182, 0.1)',
                                        borderRadius: '50%',
                                        p: 0.8,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        width: 40,
                                        height: 40,
                                        mb: 0.5
                                    }}>
                                        {mode.icon}
                                    </Box>
                                    <Typography variant="subtitle1" fontWeight="bold" fontSize="0.85rem">
                                        {mode.label}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>

                {/* Selector de dificultad */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: "10px", backgroundColor: '#F7FFF7', maxWidth: "400px", mx: "auto" }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", color: difficultyMap[difficulty].color, fontSize: "1rem" }}>
                        Dificultad: {difficultyMap[difficulty].label}
                    </Typography>

                    <Box 
                        sx={{ 
                            width: "70%", // Reducido del 100% al 70%
                            mx: "auto", 
                            mb: 5,
                            backgroundColor: '#F7FFF7', 
                            borderRadius: "15px",
                            padding: 3, // Reducido de 4 a 3
                            boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.2)' // Sombra menos pronunciada
                        }}
                    >
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                mb: 1.5, // Reducido de 2 a 1.5
                                fontWeight: "bold", 
                                color: difficultyMap[difficulty].color,
                                fontFamily: '"Press Start 2P", cursive',
                                fontSize: '0.85rem' // Reducido de 1rem a 0.85rem
                            }}
                        >
                            Dificultad: {difficultyMap[difficulty].label}
                        </Typography>
                        <Slider
                            value={difficulty}
                            min={0}
                            max={2}
                            step={1}
                            marks={[
                                { value: 0, label: "Fácil" },
                                { value: 1, label: "Medio" },
                                { value: 2, label: "Difícil" },
                            ]}
                            onChange={(_, newValue) => setDifficulty(newValue as number)}
                            sx={{
                                color: difficultyMap[difficulty].color,
                                height: 6, // Reducido de 8 a 6
                                '& .MuiSlider-thumb': {
                                    width: 20, // Reducido de 24 a 20
                                    height: 20, // Reducido de 24 a 20
                                },
                                '& .MuiSlider-markLabel': {
                                    fontFamily: '"Press Start 2P", cursive',
                                    fontSize: '0.7rem', // Reducido de 0.8rem a 0.7rem
                                    marginTop: '8px' // Reducido de 10px a 8px
                                },
                                '& .MuiSlider-rail': {
                                    height: 6 // Reducido de 8 a 6
                                },
                                '& .MuiSlider-track': {
                                    height: 6 // Reducido de 8 a 6
                                }
                            }}
                        />
                    </Box>

                    <Button
                        onClick={handleButtonClick}
                        sx={{
                            color: difficultyMap[difficulty].color,
                            '& .MuiSlider-markLabel': {
                                fontSize: '0.7rem'
                            }
                        }}
                    />
                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', fontSize: "0.8rem" }}>
                        Tiempo por pregunta: {difficultyMap[difficulty].time} segundos
                    </Typography>
                </Paper>

                <Button
                    onClick={handleButtonClick}
                    sx={{
                        backgroundColor: "#5f4bb6",
                        color: "white",
                        fontSize: "1.2rem",
                        fontWeight: "bold",
                        padding: "12px 24px",
                        borderRadius: "8px",
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                        transition: "all 0.3s ease-in-out",
                        "&:hover": {
                            backgroundColor: "#EDC9FF",
                            transform: "scale(1.05)",
                        },
                        "&:active": {
                            transform: "scale(0.95)",
                        },
                    }}
                >
                    🎮 JUGAR
                </Button>
            </Box>

            <Paper elevation={3} sx={{
                mt: 4,
                padding: "16px",
                textAlign: "center",
                width: "100%",
                maxWidth: "350px",
                borderRadius: "10px",
                backgroundColor: "#F7FFF7",
            }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                    📊 Estadísticas
                </Typography>
                <Typography variant="body2">
                    <b>Tiempo Jugado:</b> {stats.timePlayed} segundos
                </Typography>
                <Typography variant="body2">
                    <b>Partidas Jugadas:</b> {stats.gamesPlayed}
                </Typography>
                <Typography variant="body2">
                    <b>Puntuación total:</b> {stats.puntuation}
                </Typography>
                <Typography variant="body2" sx={{ color: "#4CAF50" }}>
                    <b>Aciertos:</b> {stats.correctAnswered}
                </Typography>
                <Typography variant="body2" sx={{ color: "#F44336" }}>
                    <b>Fallos:</b> {stats.incorrectAnswered}
                </Typography>
            </Paper>
        </Box>
    );
};

export default Main;