// ChatComponent.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import axios from 'axios';

import Header from './Header';
import MessageList from './MessageList';
import InputArea from './InputArea';

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

		const userMessage = {
			sender: 'user',
			text: input
		};
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
					messages: [{
						role: 'user',
						content: input
					}],
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
				<Header
					model={model}
					models={models}
					isDarkMode={isDarkMode}
					setModel={setModel}
					setIsDarkMode={setIsDarkMode}
				/>

				<MessageList
					messages={messages}
					messageContainerRef={messageContainerRef}
					isLoading={isLoading}
				/>

				<InputArea
					input={input}
					isLoading={isLoading}
					handleInputChange={handleInputChange}
					handleSend={handleSend}
					isDarkMode={isDarkMode}
				/>
			</Container>
		</div>
	);
};

export default ChatComponent;