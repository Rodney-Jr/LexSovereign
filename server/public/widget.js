(function () {
    const scriptTag = document.currentScript;
    const botId = scriptTag.getAttribute('data-bot-id');
    const baseUrl = new URL(scriptTag.src).origin;

    if (!botId) {
        console.error("NomosDesk Widget: data-bot-id attribute is missing.");
        return;
    }

    // Styles
    const style = document.createElement('style');
    style.innerHTML = `
        .ls-widget-launcher {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: #059669; /* emerald-600 */
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            transition: transform 0.2s;
        }
        .ls-widget-launcher:hover { transform: scale(1.1); }
        .ls-widget-launcher svg { color: white; width: 32px; height: 32px; }
        
        .ls-widget-container {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 380px;
            height: 600px;
            background: #0f172a; /* slate-900 */
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 20px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            display: none;
            flex-direction: column;
            z-index: 9999;
            overflow: hidden;
            font-family: system-ui, -apple-system, sans-serif;
        }
        .ls-widget-container.open { display: flex; }
        
        .ls-header {
            padding: 16px;
            background: rgba(5, 150, 105, 0.1);
            border-bottom: 1px solid rgba(255,255,255,0.05);
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: white;
        }
        .ls-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .ls-msg {
            padding: 10px 14px;
            border-radius: 12px;
            max-width: 85%;
            font-size: 14px;
            line-height: 1.4;
        }
        .ls-msg.bot {
            align-self: flex-start;
            background: rgba(255,255,255,0.05);
            color: #e2e8f0;
            border-top-left-radius: 2px;
        }
        .ls-msg.user {
            align-self: flex-end;
            background: #059669;
            color: white;
            border-top-right-radius: 2px;
        }
        .ls-input-area {
            padding: 16px;
            border-top: 1px solid rgba(255,255,255,0.05);
            background: rgba(0,0,0,0.2);
            display: flex;
            gap: 8px;
        }
        .ls-input {
            flex: 1;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 10px;
            color: white;
            outline: none;
        }
        .ls-send-btn {
            background: #059669;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0 16px;
            cursor: pointer;
            font-weight: bold;
        }
        .ls-footer {
            padding: 8px;
            text-align: center;
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            background: #020617;
        }
    `;
    document.head.appendChild(style);

    // Initial Config Fetch
    let config = null;

    // UI Elements
    const launcher = document.createElement('div');
    launcher.className = 'ls-widget-launcher';
    launcher.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;

    const container = document.createElement('div');
    container.className = 'ls-widget-container';
    container.innerHTML = `
        <div class="ls-header">
            <span id="ls-bot-name">...</span>
            <button style="background:none; border:none; color:#94a3b8; cursor:pointer;" onclick="this.closest('.ls-widget-container').classList.remove('open')">✕</button>
        </div>
        <div class="ls-messages" id="ls-messages"></div>
        <div class="ls-input-area">
            <input type="text" class="ls-input" id="ls-input" placeholder="Type a message..." />
            <button class="ls-send-btn" id="ls-send">Send</button>
        </div>
        <div class="ls-footer">
            Powered by NomosDesk
        </div>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(container);

    // Event Listeners
    launcher.addEventListener('click', () => {
        container.classList.toggle('open');
        if (!config) initConfig();
    });

    const messagesDiv = container.querySelector('#ls-messages');
    const input = container.querySelector('#ls-input');
    const sendBtn = container.querySelector('#ls-send');

    async function initConfig() {
        try {
            const res = await fetch(`${baseUrl}/api/chatbot/config/public/${botId}`);
            if (!res.ok) throw new Error("Failed to load bot config");
            config = await res.json();

            document.getElementById('ls-bot-name').textContent = config.botName;
            addMessage('bot', config.welcomeMessage || "Hello.");
        } catch (e) {
            console.error(e);
            addMessage('bot', "Unable to connect to Sovereign Service.");
        }
    }

    function addMessage(role, text) {
        const div = document.createElement('div');
        div.className = `ls-msg ${role}`;
        div.textContent = text;
        messagesDiv.appendChild(div);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        addMessage('user', text);
        input.value = '';

        try {
            const res = await fetch(`${baseUrl}/api/chatbot/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    // Pass the botId so the backend knows which System Instruction to use
                    config: { id: botId, ...config }
                })
            });
            const data = await res.json();
            addMessage('bot', data.text);
        } catch (e) {
            addMessage('bot', "Connection error.");
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

})();
