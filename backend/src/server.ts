import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mode1Routes from './mode1/routes';
import mode2Routes from "./mode2/routes";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000']
}));

app.use(express.json());

// Routes
app.use('/api/mode1', mode1Routes);
app.use('/api/mode2', mode2Routes);

app.get('/', (req, res) => {
    res.json({ message: 'SusMap Backend is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
