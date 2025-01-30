// MessageList.jsx
import React from 'react';
import Message from './Message';

const MessageList = ({ messages, messageContainerRef, isLoading }) => {
	return (
		<div className="message-container" ref={messageContainerRef}>
			{messages.map((msg, index) => (
				<Message key={index} message={msg} />
			))}
			{isLoading && (
				<div className="spinner-container">
					<div className="spinner" />
				</div>
			)}
		</div>
	);
};
export default MessageList;