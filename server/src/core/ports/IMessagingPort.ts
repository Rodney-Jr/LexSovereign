export type MessageChannel = 'WHATSAPP' | 'EMAIL' | 'SMS' | 'IN_APP';

export interface MessageContent {
    subject?: string;
    body: string;
    templateId?: string;
    templateVariables?: Record<string, string>;
    attachments?: Array<{
        filename: string;
        content: Buffer;
        mimeType: string;
    }>;
}

export interface IMessagingPort {
    /**
     * Send a notification to a specific recipient.
     * @param to Recipient address (phone number, email, or user ID).
     * @param content The message content.
     * @param channel The delivery channel to use.
     * @returns The message ID assigned by the provider.
     */
    send(to: string, content: MessageContent, channel: MessageChannel): Promise<string>;

    /**
     * Register a callback for receiving incoming messages (Webhooks).
     * @param handler Function to process incoming messages.
     */
    onMessageReceived(handler: (msg: IncomingMessage) => void): void;
}

export interface IncomingMessage {
    id: string;
    from: string;
    channel: MessageChannel;
    content: string;
    timestamp: Date;
    metadata?: any;
}
