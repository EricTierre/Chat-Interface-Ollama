import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner, FloatingLabel } from 'react-bootstrap';
import axios from 'axios';
import { IoSend } from "react-icons/io5";
import 'bootstrap/dist/css/bootstrap.min.css';

const ChatComponent = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [model, setModel] = useState("llama3");
    const [isDarkMode, setIsDarkMode] = useState(true);
    const messageContainerRef = useRef(null);

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const scrollToBottom = () => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    };

    const handleSend = async () => {
        if (input.trim() === '') return;

        const userMessage = { sender: 'user', text: input };
        setMessages([...messages, userMessage]);
        setInput('');
        setIsLoading(true);

        let ongoingResponse = '';

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/generate`, {
                model: model,
                prompt: input,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                responseType: 'text',
            });

            const dataLines = response.data.split('\n');
            for (const line of dataLines) {
                if (line.trim()) {
                    const responseData = JSON.parse(line);
                    ongoingResponse += responseData.response;
                    // eslint-disable-next-line
                    setMessages((prevMessages) => {
                        const updatedMessages = [...prevMessages];
                        if (updatedMessages.length > 0 && updatedMessages[updatedMessages.length - 1].sender === 'api') {
                            updatedMessages[updatedMessages.length - 1] = { sender: 'api', text: ongoingResponse };
                        } else {
                            updatedMessages.push({ sender: 'api', text: ongoingResponse });
                        }
                        return updatedMessages;
                    });

                    if (responseData.done) {
                        setIsLoading(false);
                        break;
                    }
                }
            }

            setIsLoading(false);
        } catch (error) {
            const errorMessage = { sender: 'api', text: 'Error: Could not retrieve response from API' };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const lightTheme = {
        backgroundColor: '#f9f9f9',
        color: 'black',
    };

    const darkTheme = {
        backgroundColor: '#2c2c2c',
        color: 'white',
    };

    const themeStyles = isDarkMode ? darkTheme : lightTheme;

    return (
        <div style={{ ...themeStyles }}>
            <Container style={{ ...themeStyles, margin: 'auto', height: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Row style={{ flex: 1 }}>
                    <Col style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        <FloatingLabel className='mb-3 mt-3' controlId="floatingSelect" label="Models" style={{ backgroundColor: 'transparent' }}>
                            <Form.Select
                                aria-label="Default select example"
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                style={{
                                    backgroundColor: isDarkMode ? '#555' : 'white',
                                    color: isDarkMode ? 'white' : 'black',
                                    borderColor: isDarkMode ? '#444' : '#ccc'
                                }}
                            >
                                {/* ADDED MORE MODELS */}
                                <option value={"llama3"}>llama3</option>
                                <option value={"phi3:medium"}>phi3:medium</option>
                            </Form.Select>
                        </FloatingLabel>

                        <Form.Check
                            type="switch"
                            id="dark-mode-switch"
                            label={isDarkMode ? 'Dark Mode' : 'Light Mode'}
                            checked={isDarkMode}
                            onChange={() => setIsDarkMode(prevMode => !prevMode)}
                            className="mb-3"
                        />

                        <div className='mb-3' ref={messageContainerRef} style={{ flex: 1, Height: '60vh', maxHeight: '65vh', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '8px', padding: '10px', ...themeStyles }}>
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    style={{
                                        marginBottom: '30px',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        backgroundColor: msg.sender === 'user' ? (isDarkMode ? '#818589' : '#818589') : 'transparent',
                                        color: msg.sender === 'user' ? 'white' : isDarkMode ? 'white' : 'black',
                                        textAlign: msg.sender === 'user' ? 'right' : 'left',
                                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                        marginLeft: msg.sender === 'user' ? 'auto' : '0',
                                        width: msg.sender === 'user' ? '50%' : null,
                                        fontFamily: 'monospace',
                                        whiteSpace: 'pre-wrap',
                                        wordWrap: 'break-word',
                                        border: msg.sender === 'user' ? '1px solid #ccc' : null,
                                        // backgroundColor: msg.text.includes('```code```') ? '#f0f0f0' : (msg.sender === 'user' ? (isDarkMode ? '#818589' : '#818589') : 'transparent'),
                                    }}
                                >
                                    {msg.text.split('\n').map((line, i) => (
                                        <React.Fragment key={i}>
                                            {/* {msg.text.includes('```code```') ? (
                                                <code style={{ display: 'block', padding: '4px' }}>{line}</code>
                                            ) : ( */}
                                                <span>{line}</span>
                                            {/* )} */}
                                            <br />
                                        </React.Fragment>
                                    ))}
                                </div>
                            ))}


                            {isLoading && (
                                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                                    <Spinner animation="border" role="status">
                                        <span className="sr-only"></span>
                                    </Spinner>
                                </div>
                            )}
                        </div>
                        <Form className='mb-3' onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', alignItems: 'center', marginTop: 'auto' }}>
                            <Form.Control
                                as="textarea"
                                placeholder="Your message ..."
                                value={input}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                style={{
                                    flex: 1,
                                    marginRight: '10px',
                                    minHeight: '150px',
                                    resize: 'none',
                                    ...themeStyles,
                                    backgroundColor: isDarkMode ? '#555' : 'white',
                                    color: isDarkMode ? 'white' : 'black',
                                }}
                            />
                            <Button
                                variant={isDarkMode ? 'secondary' : 'primary'}
                                type="submit"
                                disabled={isLoading}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <IoSend style={{ width: '20px', height: '20px', marginLeft: '5px' }} />
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ChatComponent;
