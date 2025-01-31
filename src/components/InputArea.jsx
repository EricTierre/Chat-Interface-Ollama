import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { IoSend } from "react-icons/io5";

const InputArea = ({
	input,
	isLoading,
	handleInputChange,
	handleSend,
	isDarkMode
}) => {
	const handleKeyDown = (e) => {
		if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleChange = (e) => {
		handleInputChange(e);
	};

	return (
		<Form className="input-area" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
			<div className="input-container position-relative">
				<Form.Control
					as="textarea"
					className="message-input pe-5"
					placeholder="Type your message here... (Enter to send, Ctrl+Enter for new line)"
					value={input}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					disabled={isLoading}
					rows={1}
					style={{
						resize: 'none',
						paddingRight: '3rem',
						minHeight: '2.5rem',
						maxHeight: '150px',
						overflow: 'auto'
					}}
				/>
				<Button
					className="send-button position-absolute"
					variant={isDarkMode ? 'light' : 'primary'}
					type="submit"
					disabled={isLoading}
					style={{
						right: '8px',
						top: '50%',
						transform: 'translateY(-50%)',
						padding: '4px 8px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<IoSend style={{ width: '16px', height: '16px' }} />
				</Button>
			</div>
		</Form>
	);
};

export default InputArea;