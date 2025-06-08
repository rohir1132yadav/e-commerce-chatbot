import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  AppBar,
  Toolbar,
} from '@mui/material';
import { Send as SendIcon, Logout as LogoutIcon } from '@mui/icons-material';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [products, setProducts] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
      startNewSession();
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startNewSession = async () => {
    try {
      const response = await api.post('/chat/session', {
        userId: user.userId,
      });
      setSessionId(response.data.sessionId);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error starting chat session:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = { content: input, sender: 'user' };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');

    try {
      const response = await api.post('/chat/message', {
        sessionId,
        message: input,
        userId: user.userId,
      });

      setMessages(response.data.messages);

      // Check if the response contains product information
      const lastMessage = response.data.messages[response.data.messages.length - 1];
      if (lastMessage.content.includes('products matching your search')) {
        const searchTerms = input.split(' ').slice(1).join(' ');
        const productsResponse = await api.get(`/products/search?query=${searchTerms}`);
        setProducts(productsResponse.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            E-commerce Chatbot
          </Typography>
          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', gap: 2, p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Paper
              elevation={3}
              sx={{
                height: 'calc(100vh - 180px)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  flexGrow: 1,
                  overflow: 'auto',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                {messages.map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                    }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        bgcolor: message.sender === 'user' ? 'primary.light' : 'grey.100',
                        color: message.sender === 'user' ? 'white' : 'text.primary',
                      }}
                    >
                      <Typography>{message.content}</Typography>
                    </Paper>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>

              <Box
                component="form"
                onSubmit={handleSend}
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  borderTop: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  gap: 1,
                }}
              >
                <TextField
                  fullWidth
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  variant="outlined"
                  size="small"
                />
                <IconButton type="submit" color="primary">
                  <SendIcon />
                </IconButton>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                height: 'calc(100vh - 180px)',
                overflow: 'auto',
                p: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Products
              </Typography>
              <Grid container spacing={2}>
                {products.map((product) => (
                  <Grid item xs={12} key={product._id}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="140"
                        image={product.imageUrl}
                        alt={product.name}
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h6" component="div">
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ${product.price}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Chat; 