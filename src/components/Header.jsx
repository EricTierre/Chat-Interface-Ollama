import React, { useEffect } from 'react';
import { FloatingLabel, Form } from 'react-bootstrap';

const Header = ({ model, models, isDarkMode, setModel, setIsDarkMode }) => {
	useEffect(() => {
		// Load saved preferences from localStorage on component mount
		const savedModel = localStorage.getItem('selectedModel');
		const savedDarkMode = localStorage.getItem('isDarkMode');

		if (savedModel && models.some(m => m.name === savedModel)) {
			setModel(savedModel);
		}

		if (savedDarkMode !== null) {
			setIsDarkMode(savedDarkMode === 'true');
		}
	}, [models, setModel, setIsDarkMode]);

	const handleModelChange = (e) => {
		const newModel = e.target.value;
		setModel(newModel);
		localStorage.setItem('selectedModel', newModel);
	};

	const handleThemeChange = () => {
		setIsDarkMode(prevMode => {
			const newMode = !prevMode;
			localStorage.setItem('isDarkMode', newMode);
			return newMode;
		});
	};

	return (
		<div className="header-controls">
			<FloatingLabel controlId="floatingSelect" label="Select Model">
				<Form.Select
					className="model-select"
					value={model}
					onChange={handleModelChange}
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
				onChange={handleThemeChange}
				className="theme-switch"
			/>
		</div>
	);
};

export default Header;