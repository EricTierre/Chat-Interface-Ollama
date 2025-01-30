// MessageThinking.jsx
import React from 'react';
import { Collapse } from 'react-bootstrap';

const MessageThinking = ({ thinking, isOpen, onToggle }) => {
    return (
        <div className="thinking-container">
            <div className="thinking-header" onClick={onToggle}>
                <span className={`toggle-icon ${isOpen ? 'expanded' : ''}`}>▶</span>
                Thinking Process
            </div>
            <Collapse in={isOpen}>
                <div>
                    <div className="thinking-content">
                        {thinking}
                    </div>
                </div>
            </Collapse>
        </div>
    );
};
export default MessageThinking;