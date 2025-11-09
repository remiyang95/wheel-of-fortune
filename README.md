# Wheel of Fortune

A customizable, interactive wheel spinner web application that allows users to create, save, and manage wheels with custom options. Built with HTML5 Canvas, CSS3, and JavaScript, with Firebase integration for data persistence.

## Features

- 🎡 Interactive, animated spinning wheel
- ➕ Add/remove custom options
- 💾 Save and load wheel configurations
- 🎨 Responsive design that works on desktop and mobile
- 🔄 Real-time updates to the wheel as options change
- 🎉 Confetti animation on wheel spin completion

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js and npm (for development)
- Firebase project (for data persistence)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/wheel-of-fortune.git
   cd wheel-of-fortune
   ```

2. Set up Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Update the Firebase configuration in `index.html` with your project's credentials

3. Run locally:
   ```bash
   # Using Python's built-in server
   python3 -m http.server 8000
   ```
   Then open `http://localhost:8000` in your browser.

## Usage

1. **Adding Options**:
   - Type an option in the input field and click "Add Option" or press Enter
   - Options will appear in the list below and be added to the wheel

2. **Spinning the Wheel**:
   - Click the "Spin the Wheel!" button to start the animation
   - The wheel will spin and randomly select an option

3. **Saving Wheels**:
   - Enter a name for your wheel in the "Name your wheel" field
   - Click "Save" to store the wheel configuration
   - Saved wheels appear in the "Your Saved Wheels" section

4. **Managing Wheels**:
   - Click on a saved wheel to load it
   - Use the "Create New Wheel" link to start fresh

## Project Structure

```
wheel-of-fortune/
├── index.html          # Main HTML file
├── script.js           # Main JavaScript application logic
├── styles.css          # Styling
├── README.md           # This file
└── firebase-config.js  # Firebase configuration (generated)
```

## Customization

### Styling

You can customize the appearance by modifying `styles.css`. Key variables to adjust:

- `--primary-color`: Main theme color
- `--secondary-color`: Accent color
- `--text-color`: Main text color
- `--background-color`: Page background

### Wheel Configuration

In `script.js`, you can adjust:

- `spinDuration`: How long the wheel spins (in milliseconds)
- `spinRounds`: Number of full rotations before stopping
- `spinEasing`: Easing function for the spin animation

## Deployment

To deploy to production:

1. Build the project (if using a build step)
2. Deploy to your preferred static hosting (Firebase Hosting, Netlify, Vercel, etc.)

### Firebase Hosting

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (select Hosting)
firebase init

# Deploy
firebase deploy --only hosting
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgments

- Built with vanilla JavaScript, HTML5 Canvas, and CSS3
- Uses Firebase for backend services
- Inspired by various wheel spinner applications
