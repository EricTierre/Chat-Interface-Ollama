// Message.jsx
import React from 'react';
import { Image } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import MessageThinking from './MessageThinking';

const Message = ({ message }) => {
	const { sender, text, image, thinking, isThinkingOpen, isStreaming } = message;

	return (
		<div className={`message-group`}>
			{sender === 'api' && thinking && (
				<MessageThinking
					thinking={thinking}
					isOpen={isThinkingOpen}
					onToggle={() => {
						// Handle toggle logic here
					}}
				/>
			)}
			<div className={`message ${sender === 'user' ? 'user-message' : 'api-message'}`}>
				{image && (
					<div className="message-image">
						<Image src={image} alt="Uploaded" fluid />
					</div>
				)}
				<ReactMarkdown
					remarkPlugins={[remarkMath, remarkGfm]}
					rehypePlugins={[rehypeKatex, rehypeHighlight]}
					components={{
						p: ({ node, ...props }) => <p style={{ margin: 0 }} {...props} />,
						a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />,
						pre: ({ node, children, ...props }) => (
							<pre className="code-block" {...props}>
								{children}
							</pre>
						),
						code: ({ node, inline, className, children, ...props }) => {
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
					{text}
				</ReactMarkdown>
				{isStreaming && (
					<span className="typing-indicator">
						<span>.</span>
						<span>.</span>
						<span>.</span>
					</span>
				)}
			</div>
		</div>
	);
};
export default Message;