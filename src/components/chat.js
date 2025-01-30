import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Form, Button, FloatingLabel, Collapse } from 'react-bootstrap';
import axios from 'axios';
import { IoSend } from "react-icons/io5";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'highlight.js/styles/github-dark.css';
import 'katex/dist/katex.min.css';

const ChatComponent = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [model, setModel] = useState("");
    const [models, setModels] = useState([]);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const messageContainerRef = useRef(null);

    const fetchModels = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/tags`);
            console.log(response.data)
            const modelList = Array.isArray(response.data.models) ? response.data.models : [];
            setModels(modelList);
            if (modelList.length > 0) {
                setModel(modelList[0].name);
            }
        } catch (error) {
            console.error('Error fetching models:', error);
        }
    };

    useEffect(() => {
        fetchModels();
    }, []);

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
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: 'user', content: input }],
                    stream: true
                })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let responseText = '';

            setMessages(prev => [...prev, { sender: 'api', text: '', isStreaming: true }]);

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.trim() === '') continue;
                    try {
                        const data = JSON.parse(line);
                        responseText += data.message?.content || '';
                        
                        // Handle thinking content
                        let isThinking = false;
                        let thinkingContent = '';
                        let mainContent = '';
                        
                        const currentText = data.message?.content || '';
                        
                        if (currentText.includes('<think>')) {
                            isThinking = true;
                            thinkingContent = responseText;
                        } else if (currentText.includes('</think>')) {
                            isThinking = false;
                            const parts = responseText.split('</think>');
                            thinkingContent = parts[0].replace('<think>', '').trim();
                            mainContent = parts[1].trim();
                        } else {
                            if (responseText.includes('</think>')) {
                                const parts = responseText.split('</think>');
                                thinkingContent = parts[0].replace('<think>', '').trim();
                                mainContent = parts[1].trim();
                            } else if (responseText.includes('<think>')) {
                                thinkingContent = responseText.replace('<think>', '').trim();
                            } else {
                                mainContent = responseText;
                            }
                        }
                        
                        setMessages(prev => {
                            const newMessages = [...prev];
                            const lastMessage = newMessages[newMessages.length - 1];
                            if (lastMessage.sender === 'api') {
                                if (thinkingContent) {
                                    lastMessage.thinking = thinkingContent;
                                    lastMessage.isThinkingOpen = true;
                                }
                                lastMessage.text = mainContent;
                                if (data.done) {
                                    lastMessage.isStreaming = false;
                                }
                            }
                            return newMessages;
                        });

                        if (data.done) {
                            setIsLoading(false);
                            break;
                        }
                    } catch (e) {
                        console.error('Error parsing JSON:', e);
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, { 
                sender: 'api', 
                text: 'Error: Could not retrieve response from API',
                isStreaming: false 
            }]);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className={`chat-container ${isDarkMode ? 'dark-mode' : ''}`}>
            <Container className="chat-layout">
                <div className="header-controls">
                    <FloatingLabel controlId="floatingSelect" label="Select Model">
                        <Form.Select
                            className="model-select"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                        >
                            {models.map((modelOption) => (
                                <option key={modelOption.name} value={modelOption.name}>
                                    {modelOption.name}
                                </option>
                            ))}
                        </Form.Select>
                    </FloatingLabel>

                    <Form.Check
                        type="switch"
                        id="dark-mode-switch"
                        label={isDarkMode ? 'Dark Mode' : 'Light Mode'}
                        checked={isDarkMode}
                        onChange={() => setIsDarkMode(prevMode => !prevMode)}
                        className="theme-switch"
                    />
                </div>

                <div className="message-container" ref={messageContainerRef}>
                    {messages.map((msg, index) => (
                                <div key={index} className={`message-group`}>
                                    {msg.sender === 'api' && msg.thinking && (
                                        <div className="thinking-container">
                                            <div
                                                className="thinking-header"
                                                onClick={() => {
                                                    setMessages(prev => {
                                                        const newMessages = [...prev];
                                                        const message = newMessages[index];
                                                        message.isThinkingOpen = !message.isThinkingOpen;
                                                        return newMessages;
                                                    });
                                                }}
                                            >
                                                <span className={`toggle-icon ${msg.isThinkingOpen ? 'expanded' : ''}`}>▶</span>
                                                Thinking Process
                                            </div>
                                            <Collapse in={msg.isThinkingOpen}>
                                                <div>
                                                    <div className="thinking-content">
                                                        {msg.thinking}
                                                    </div>
                                                </div>
                                            </Collapse>
                                        </div>
                                    )}
                                    <div className={`message ${msg.sender === 'user' ? 'user-message' : 'api-message'}`}>
                                        <ReactMarkdown 
                                            remarkPlugins={[remarkMath, remarkGfm]}
                                            rehypePlugins={[rehypeKatex, rehypeHighlight]}
                                            components={{
                                                p: ({node, ...props}) => <p style={{margin: 0}} {...props}/>,
                                                a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" {...props}/>,
                                                pre: ({node, children, ...props}) => (
                                                    <pre className="code-block" {...props}>
                                                        {children}
                                                    </pre>
                                                ),
                                                code: ({node, inline, className, children, ...props}) => {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    return !inline && match ? (
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    ) : (
                                                        <code className="inline-code" {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                }
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                        {msg.isStreaming && (
                                            <span className="typing-indicator">
                                                <span>.</span>
                                                <span>.</span>
                                                <span>.</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                    ))}

                    {isLoading && (
                        <div className="spinner-container">
                            <div className="spinner" />
                        </div>
                    )}
                </div>

                <Form className="input-area" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                    <div className="d-flex gap-3">
                        <Form.Control
                            as="textarea"
                            className="message-input"
                            placeholder="Type your message here..."
                            value={input}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                        <Button
                            className="send-button"
                            variant={isDarkMode ? 'light' : 'primary'}
                            type="submit"
                            disabled={isLoading}
                        >
                            <IoSend style={{ width: '20px', height: '20px', marginLeft: '5px' }} />
                        </Button>
                    </div>
                </Form>
            </Container>
        </div>
    );
};

export default ChatComponent;
