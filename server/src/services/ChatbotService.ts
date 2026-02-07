import fs from 'fs';
import path from 'path';
import { ChatbotConfig } from '../types';

const DATA_DIR = path.join(__dirname, '../../data');
const CONFIG_FILE = path.join(DATA_DIR, 'chatbot_config.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_CONFIG: ChatbotConfig = {
    id: 'bot_01',
    botName: 'SovereignAssistant',
    welcomeMessage: 'Welcome. I am your Sovereign Assistant. How can I help you onboard today?',
    isEnabled: true,
    channels: { whatsapp: true, webWidget: true },
    knowledgeBaseIds: [],
    systemInstruction: 'You are a lead generation bot for a premium law firm.'
};

export class ChatbotService {
    static getConfig(): ChatbotConfig {
        try {
            if (!fs.existsSync(CONFIG_FILE)) {
                return DEFAULT_CONFIG;
            }
            const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error("Failed to read chatbot config:", error);
            return DEFAULT_CONFIG;
        }
    }

    static saveConfig(config: ChatbotConfig): ChatbotConfig {
        try {
            fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
            return config;
        } catch (error) {
            console.error("Failed to save chatbot config:", error);
            throw new Error("Failed to persist configuration");
        }
    }
}
