import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Tabs, 
  Tab, 
  CircularProgress, 
  Card, 
  CardContent,
  Divider,
  Chip,
  Button,
  Grid
} from '@mui/material';
import NavBar from '../Main/items/NavBar';
import axios from 'axios';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`api-tabpanel-${index}`}
      aria-labelledby={`api-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Api: React.FC = () => {
  const [value, setValue] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState<{ users: boolean; questions: boolean }>({
    users: true,
    questions: true
  });
  const [error, setError] = useState<{ users: string | null; questions: string | null }>({
    users: null,
    questions: null
  });

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8006';

  useEffect(() => {
    // Función para obtener usuarios
    const fetchUsers = async () => {
      try {
        setLoading(prev => ({ ...prev, users: true }));
        const response = await axios.get(`${apiEndpoint}/api/users`);
        setUsers(response.data);
        setError(prev => ({ ...prev, users: null }));
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(prev => ({ 
          ...prev, 
          users: err.response?.data?.error || err.message || 'Error al cargar usuarios' 
        }));
      } finally {
        setLoading(prev => ({ ...prev, users: false }));
      }
    };

    // Función para obtener preguntas
    const fetchQuestions = async () => {
      try {
        setLoading(prev => ({ ...prev, questions: true }));
        const response = await axios.get(`${apiEndpoint}/api/questions`);
        setQuestions(response.data);
        setError(prev => ({ ...prev, questions: null }));
      } catch (err: any) {
        console.error('Error fetching questions:', err);
        setError(prev => ({ 
          ...prev, 
          questions: err.response?.data?.error || err.message || 'Error al cargar preguntas' 
        }));
      } finally {
        setLoading(prev => ({ ...prev, questions: false }));
      }
    };

    fetchUsers();
    fetchQuestions();
  }, [apiEndpoint]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const refreshData = () => {
    // Reiniciar estados
    setLoading({ users: true, questions: true });
    setError({ users: null, questions: null });

    // Recargar datos
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${apiEndpoint}/api/users`);
        setUsers(response.data);
        setError(prev => ({ ...prev, users: null }));
      } catch (err: any) {
        setError(prev => ({ 
          ...prev, 
          users: err.response?.data?.error || err.message || 'Error al cargar usuarios' 
        }));
      } finally {
        setLoading(prev => ({ ...prev, users: false }));
      }
    };

    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${apiEndpoint}/api/questions`);
        setQuestions(response.data);
        setError(prev => ({ ...prev, questions: null }));
      } catch (err: any) {
        setError(prev => ({ 
          ...prev, 
          questions: err.response?.data?.error || err.message || 'Error al cargar preguntas' 
        }));
      } finally {
        setLoading(prev => ({ ...prev, questions: false }));
      }
    };

    fetchUsers();
    fetchQuestions();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default'
      }}
    >
      <NavBar />
      
      <Container maxWidth="lg" sx={{ mt: 10, mb: 4, flex: 1 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            borderRadius: 2, 
            bgcolor: 'background.paper' 
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
            API Explorer
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
            Visualización de datos desde los endpoints de la API
          </Typography>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={value} onChange={handleChange} aria-label="api tabs" centered>
              <Tab label="Usuarios" />
              <Tab label="Preguntas" />
            </Tabs>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={refreshData}
              disabled={loading.users || loading.questions}
            >
              Actualizar datos
            </Button>
          </Box>

          <TabPanel value={value} index={0}>
            <Typography variant="h6" gutterBottom>
              Datos de usuarios desde /api/users
            </Typography>
            
            {loading.users ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
              </Box>
            ) : error.users ? (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  bgcolor: 'error.light', 
                  color: 'error.contrastText',
                  borderRadius: 2
                }}
              >
                <Typography variant="body1">{error.users}</Typography>
              </Paper>
            ) : users.length === 0 ? (
              <Typography variant="body1" color="text.secondary" align="center">
                No se encontraron usuarios
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {users.map((user, index) => (
                  <Grid item xs={12} md={6} key={user._id || index}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        height: '100%',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3
                        }
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" color="primary" gutterBottom>
                          {user.username}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          <strong>ID:</strong> {user._id}
                        </Typography>
                        {user.createdAt && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Creado:</strong> {new Date(user.createdAt).toLocaleString()}
                          </Typography>
                        )}
                        {user.stats && (
                          <Box mt={1}>
                            <Typography variant="body2">
                              <strong>Estadísticas:</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Correctas: {user.stats.correctAnswered || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Incorrectas: {user.stats.incorrectAnswered || 0}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>

          <TabPanel value={value} index={1}>
            <Typography variant="h6" gutterBottom>
              Datos de preguntas desde /api/questions
            </Typography>
            
            {loading.questions ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
              </Box>
            ) : error.questions ? (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  bgcolor: 'error.light', 
                  color: 'error.contrastText',
                  borderRadius: 2
                }}
              >
                <Typography variant="body1">{error.questions}</Typography>
              </Paper>
            ) : questions.length === 0 ? (
              <Typography variant="body1" color="text.secondary" align="center">
                No se encontraron preguntas
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {questions.map((question, index) => (
                  <Grid item xs={12} key={question._id || index}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3
                        }
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" color="primary" gutterBottom>
                          {question.question}
                        </Typography>
                        
                        {question.category && (
                          <Chip 
                            label={question.category} 
                            size="small" 
                            color="secondary" 
                            sx={{ mb: 2 }}
                          />
                        )}
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Typography variant="subtitle2" gutterBottom>
                          Opciones:
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          {question.options && question.options.map((option: string, i: number) => (
                            <Chip 
                              key={i}
                              label={option}
                              variant={option === question.correctAnswer ? "filled" : "outlined"}
                              color={option === question.correctAnswer ? "success" : "default"}
                            />
                          ))}
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary">
                          <strong>ID:</strong> {question._id}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
};

export default Api;