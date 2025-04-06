import React, {useState} from 'react';
import { Box, TextField, IconButton, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

interface LLMChatProps {
  question: string;
  solution: string;
  options: string[];
  onClueUsed: () => void; // Nuevo prop para notificar que se usó una pista
}

const LLMChat: React.FC<LLMChatProps> = ({ question, solution, options, onClueUsed }) => {
  const apiEndpoint: string = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'system' }[]>([
    { text: "Pregunta una pista a su IA de confianza a cambio del 50% de su puntuación", sender: 'system' }
  ]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [clueUsed, setClueUsed] = useState<boolean>(false); // Para rastrear si ya se usó una pista

  const handleSendMessage = async () => {
    if (newMessage.trim() !== "") {
      const userMessage = newMessage.trim();
      setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
      setNewMessage(""); // Limpiar el input inmediatamente
      setIsLoading(true);
      
      if (!clueUsed) {
        setClueUsed(true);
        onClueUsed(); // Envia el aviso a game para multar la puntuación
      }
      
      try {
        // Uso del endpoint game-hint
        const response = await axios.post(`${apiEndpoint}/game-hint`, {
          question: question,
          solution: solution,
          options: options,
          userMessage: userMessage
        });
        
        if (response.data && response.data.answer) {
          setMessages(prev => [...prev, { text: response.data.answer, sender: 'system' }]);
        } else {
          setMessages(prev => [...prev, { 
            text: "Lo siento, no pude generar una pista en este momento.", 
            sender: 'system' 
          }]);
        }
      } catch (error) {
        console.error("Error al obtener pista:", error);
        setMessages(prev => [...prev, { 
          text: "Ocurrió un error al procesar tu solicitud. Inténtalo nuevamente.", 
          sender: 'system' 
        }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Manejar envío al presionar Enter ;D
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box
      sx={{
        width: '100%', // Ancho fijo para la columna de chat
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#202A25',
        borderRadius: 2,
        boxShadow: 3,
        margin: 1,
        height: 'calc(100% - 16px)', // Altura completa menos los márgenes
        minHeight: '0' // Importante para que flex funcione correctamente
    }}
    >
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          mb: 2,
          m: 1,
          minHeight: 180,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
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
                bgcolor: message.sender === 'user' ? '#5f4bb6' : '#F7FFF7',
                color: message.sender === 'user' ? '#F7FFF7' : '#202A25',
                p: 1.5,
                borderRadius: 2,
                maxWidth: '80%',
                wordBreak: 'break-word'
              }}
            >
              {message.text}
            </Typography>
          </Box>
        ))}
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              mb: 1,
            }}
          >
            <Typography
              sx={{
                bgcolor: 'grey.200',
                color: 'black',
                p: 1.5,
                borderRadius: 2,
              }}
            >
              Pensando...
            </Typography>
          </Box>
        )}
      </Box>
      <Box display="flex">
        <TextField
          fullWidth
          placeholder="Escribe tu mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          sx={{
              m: 1,
              '& .MuiInputBase-input': {
                  color: '#F7FFF7', // Color del texto ingresado
              },
              '& .MuiInputLabel-root': {
                  color: '#F7FFF7', // Color del placeholder
              },
              '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                      borderColor: '#F7FFF7', // Color del borde
                  },
                  '&:hover fieldset': {
                      borderColor: '#F7FFF7', // Color del borde al hover
                  },
              },
          }}
          variant="outlined"
          size="small"
        />
        <IconButton
          onClick={handleSendMessage} 
          disabled={isLoading || newMessage.trim() === ''}

        >
          <SendIcon sx = {{ color: '#F7B801'}}/>
        </IconButton>
      </Box>
    </Box>
  );
};

export default LLMChat;