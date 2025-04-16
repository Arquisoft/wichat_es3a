import { useEffect, useState } from "react";
import { Box, Button, Typography, Paper, Avatar, IconButton } from "@mui/material";
import NavBar from "./items/NavBar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PublicIcon from '@mui/icons-material/Public';
import HistoryIcon from '@mui/icons-material/History';
import ScienceIcon from '@mui/icons-material/Science';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PetsIcon from '@mui/icons-material/Pets';
import PaletteIcon from '@mui/icons-material/Palette';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

interface StatEntry {
    username: string;
    puntuation: number;
}

const Main = () => {
    const navigate = useNavigate();
    const [topRanking, setTopRanking] = useState<StatEntry[]>([]);
    const [stats, setStats] = useState({
        timePlayed: 0,
        gamesPlayed: 0,
        correctAnswered: 0,
        incorrectAnswered: 0,
        puntuation: 0
    });
    const [currentSlide, setCurrentSlide] = useState(0);

    const isAuthenticated = !!localStorage.getItem("token");

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            const storedUsername = localStorage.getItem("username");
            const username = storedUsername ? JSON.parse(storedUsername) : "";

            try {
                const statsResponse = await axios.get(`${apiEndpoint}/stats/${username}`);
                setStats(statsResponse.data);

                const rankingResponse = await axios.get(`${apiEndpoint}/getStats`);
                const sorted = rankingResponse.data.sort((a: StatEntry, b: StatEntry) => b.puntuation - a.puntuation);
                setTopRanking(sorted.slice(0, 3));
            } catch (error) {
                console.error("Error fetching data:", error);
                try {
                    const createResponse = await axios.post(`${apiEndpoint}/stats`, { username });
                    setStats(createResponse.data);
                } catch (createError) {
                    console.error("Error creando stats:", createError);
                }
            }
        };

        fetchData();
    }, []);

    const storedUsername = localStorage.getItem('username');
    const username = storedUsername ? JSON.parse(storedUsername) : "Jugador";

    const gameModes = [
        { value: "question", label: "Preguntas", icon: <PublicIcon />, color: "#F7B801", text: "#F7FFF7"  },
        { value: "", label: "Cartas", icon: <HistoryIcon />, color: "#EDC9FF", text: "#2A363B"},
        { value: "", label: "¡Muchas cosas están por llegar!", icon: <ScienceIcon />, color: "#5f4bb6", text: "#F7FFF7" },
    ];

    const getMedalColor = (position: number) => {
        switch(position) {
            case 0: return "#FFD700";
            case 1: return "#C0C0C0";
            case 2: return "#CD7F32";
            default: return "#5f4bb6";
        }
    };

    const navigateToGameMode = (mode: string) => {
        if (mode == "question"){
            axios.post(`${apiEndpoint}/initializeQuestionsDB`, 
                {
                    categories: ["country"]
                });
        }
        navigate(`/main/${mode}`);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === gameModes.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? gameModes.length - 1 : prev - 1));
    };

    const visibleCards = 1;
    const visibleModes = [];
    for (let i = 0; i < visibleCards; i++) {
        const index = (currentSlide + i) % gameModes.length;
        visibleModes.push(gameModes[index]);
    }

    return (
        <Box component="main" sx={{
            height: "100vh",
            width: "100vw",
            backgroundColor: "#202A25",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
        }}>
            <NavBar />

            <Box sx={{
                display: "flex",
                height: "calc(100vh - 64px)",
                width: "100vw",
                overflow: "hidden"
            }}>
                {/* Panel lateral ranking */}
                <Box sx={{
                    width: "300px",
                    backgroundColor: "#2A363B",
                    color: "#F7FFF7",
                    height: "100%",
                    overflowY: "auto",
                    flexShrink: 0
                }}>
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{
                            mb: 3,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1
                        }}>
                            <EmojiEventsIcon /> Top 3 Jugadores
                        </Typography>

                        {topRanking.map((entry, index) => (
                            <Paper key={entry.username} sx={{
                                mb: 2,
                                p: 2,
                                backgroundColor: "#5f4bb6",
                                color: "#F7FFF7",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                borderLeft: `4px solid ${getMedalColor(index)}`
                            }}>
                                <Avatar sx={{
                                    bgcolor: getMedalColor(index),
                                    width: 32,
                                    height: 32,
                                    mr: 2,
                                    fontSize: "0.8rem",
                                    fontWeight: "bold"
                                }}>
                                    {index + 1}
                                </Avatar>
                                <Box>
                                    <Typography fontWeight="bold">{entry.username}</Typography>
                                    <Typography variant="body2">Puntos: {entry.puntuation}</Typography>
                                </Box>
                            </Paper>
                        ))}

                        <Box sx={{ mt: 4 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1, textAlign: "center" }}>
                                Tus Estadísticas
                            </Typography>
                            <Paper sx={{ p: 2, backgroundColor: "#5f4bb6", color: "#F7FFF7", borderRadius: "8px" }}>
                                <Typography variant="body2">Partidas: {stats.gamesPlayed}</Typography>
                                <Typography variant="body2">Aciertos: {stats.correctAnswered}</Typography>
                                <Typography variant="body2">Puntuación: {stats.puntuation}</Typography>
                            </Paper>
                        </Box>
                    </Box>
                </Box>

                {/* Contenido principal */}
                <Box sx={{
                    flex: 1,
                    width: "900px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                }}>
                    <Typography variant="h4" sx={{
                        mb: 4,
                        color: "#F7FFF7",
                        textAlign: "center",
                        fontWeight: "bold"
                    }}>
                        ¡Hola {username}, elige un modo de juego!
                    </Typography>

                    {/* Carrusel */}
                    <Box sx={{
                        maxHeight: "60%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                    }}>
                        <IconButton
                            onClick={prevSlide}
                            sx={{
                                position: "absolute",
                                left: -40,
                                color: "#F7FFF7",
                                zIndex: 1,
                                backgroundColor: "rgba(95, 75, 182, 0.7)",
                                "&:hover": {
                                    backgroundColor: "#5f4bb6"
                                },
                            }}
                        >
                            <ChevronLeftIcon fontSize="large" />
                        </IconButton>

                        <Box sx={{
                            display: "flex",
                            width: "100%",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 3
                        }}>
                            {visibleModes.map((mode, index) => (
                                <Paper
                                    key={`${mode.value}-${index}`}
                                    onClick={() => navigateToGameMode(mode.value)}
                                    sx={{
                                        width: "280px",
                                        height: "350px",
                                        backgroundColor: mode.color,
                                        color: mode.text,
                                        borderRadius: "12px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        cursor: "pointer",
                                        transition: "transform 0.3s",
                                        "&:hover": {
                                            transform: "scale(1.03)"
                                        },
                                        p: 3,
                                        position: "relative",
                                        boxShadow: 3,
                                        flexShrink: 0
                                    }}
                                >
                                    <Avatar sx={{
                                        bgcolor: "rgba(0,0,0,0.2)",
                                        width: 80,
                                        height: 80,
                                        mb: 3
                                    }}>
                                        {mode.icon}
                                    </Avatar>
                                    <Typography variant="h5" sx={{
                                        fontWeight: "bold",
                                        mb: 2,
                                        textAlign: "center"
                                    }}>
                                        {mode.label}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        sx={{
                                            mt: 2,
                                            backgroundColor: "rgba(255,255,255,0.2)",
                                            "&:hover": {
                                                backgroundColor: "rgba(255,255,255,0.3)"
                                            },
                                            color: mode.text
                                        }}
                                    >
                                        Jugar
                                    </Button>
                                </Paper>
                            ))}
                        </Box>

                        <IconButton
                            onClick={nextSlide}
                            sx={{
                                position: "absolute",
                                right: -40,
                                color: "#F7FFF7",
                                zIndex: 1,
                                backgroundColor: "rgba(95, 75, 182, 0.7)",
                                "&:hover": {
                                    backgroundColor: "#5f4bb6"
                                }
                            }}
                        >
                            <ChevronRightIcon fontSize="large" />
                        </IconButton>
                    </Box>

                    {/* Indicadores del carrusel */}
                    <Box sx={{
                        display: "flex",
                        gap: 1,
                        mt: 2,
                        mb: 2,
                        justifyContent: "center"
                    }}>
                        {gameModes.map((_, index) => (
                            <Box
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    backgroundColor: currentSlide === index ? "#5f4bb6" : "rgba(255,255,255,0.3)",
                                    cursor: "pointer",
                                    transition: "background-color 0.3s"
                                }}
                            />
                        ))}
                    </Box>

                    {/* Juego aleatorio */}
                    <Box sx={{
                        textAlign: "center"
                    }}>
                        <Typography variant="h5" sx={{
                            mb: 3,
                            color: "#F7FFF7",
                            fontWeight: "bold"
                        }}>
                            ¿Te sientes aventurero?
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            sx={{
                                backgroundColor: "#5f4bb6",
                                color: "white",
                                fontSize: "1rem",
                                fontWeight: "bold",
                                padding: "12px 24px",
                                borderRadius: "8px",
                                boxShadow: 3,
                                "&:hover": {
                                    backgroundColor: "#EDC9FF",
                                    transform: "scale(1.02)",
                                }
                            }}
                            onClick={() => {
                                const randomMode = gameModes[Math.floor(Math.random() * gameModes.length)].value;
                                navigateToGameMode(randomMode);
                            }}
                        >
                            Modo Aleatorio
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Main;