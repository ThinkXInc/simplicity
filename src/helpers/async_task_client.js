/***
[Usage example]
const HOST = 'quantz.thinkxai.com:8001'
const RequestTokenURL = `https://${HOST}/api/request-token`
const taskHandlers = {
    'title_keywords': (messageObject) => {
        console.log('Handling title_keywords:', messageObject);
        let title = removeEndDelimiter(messageObject["title"]);
        let keywords = removeEndDelimiter(messageObject["keywords"]);
        document.getElementById('title').textContent = title;
        document.getElementById('keywords').textContent = keywords;
    },
    'sample_answer': (messageObject) => {
        console.log('Handling sample_answer:', messageObject);
        let sampleAnswer = removeEndDelimiter(messageObject["sample_answer"]);
        document.getElementById('sampleAnswer').textContent = sampleAnswer;
    },
    'review': (messageObject) => {
        console.log('Handling review:', messageObject);
        let review = removeEndDelimiter(messageObject["review"]);
        document.getElementById('review').textContent = review;
    },
};

let config = new AsyncTaskClientConfig(taskHandlers, HOST, RequestTokenURL);
let client = new AsyncTaskClient(config);
client.connect().then(() => {
    console.log("Successfully connected to the server.");
}).catch((error) => {
    console.error("Failed to connect:", error);
});
***/

class AsyncTaskClientConfig {
    constructor(taskHandlers, host, requestTokenURL) {
        this.taskHandlers = taskHandlers;
        this.host = host;
        this.requestTokenURL = requestTokenURL;
    }
}

class AsyncTaskClientRequestData {
    constructor(task, message, materialId, session, lang) {
        this.task = task;
        this.message = message;
        this.materialId = materialId;
        this.session = session;
        this.lang = lang;

        console.log(`AsyncTaskClientRequestData created => task: ${task}, message: ${message}, materialId: ${materialId}, session: ${session}, lang: ${lang}`);
    }

    toJson() {
        return JSON.stringify({
            task: this.task,
            message: this.message,
            materialId: this.materialId,
            session: this.session,
            lang: this.lang
        });
    }
}

class AsyncTaskClient {
    constructor(config) {
        this.config = config;
        this.socket = null;
        this.lang = "en";
        this.isConnected = false;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.obtainToken().then((token) => {
                if (!token) {
                    reject("Token acquisition failed.");
                    return;
                }

                const serverUrl = `wss://${this.config.host}/ws?token=${encodeURIComponent(token)}`;

                this.socket = new WebSocket(serverUrl);
                this.socket.onopen = () => {
                    console.log("Connection to server opened.");
                    this.isConnected = true; // Set connection state as true
                    resolve();
                };
                this.socket.onerror = (e) => {
                    console.error("An error occurred with the WebSocket:", e);
                    reject(e);
                };
                this.socket.onmessage = (e) => this.handleWebSocketMessage(e);
                this.socket.onclose = this.handleWebSocketClose;

            }).catch((e) => {
                console.error("Error initializing WebSocket:", e);
                reject(e);
            });
        });
    }

    async obtainToken() {
        try {
            let origin = window.location.origin;
            let response = await fetch(this.config.requestTokenURL, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ origin })
            });

            if (!response.ok) {
                throw new Error('Token request was denied. Status: ' + response.status);
            }

            return await response.text();
        } catch (error) {
            console.error('Error obtaining token:', error);
            return null;
        }
    }

    submit(message) {
        // serialized JSON string using the WebSocket,
        // the server will recognize it as a text message (websocket.TextMessage).  
        if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
            if (typeof message !== 'string') {
                message = JSON.stringify(message);
            }
            this.socket.send(message);
            console.log("Message sent to server.");
        } else {
            console.error("WebSocket is not connected or open.");
        }
    }

    handleWebSocketMessage(e) {
        if (e.data instanceof Blob) {
            e.data.arrayBuffer().then(arrayBuffer => {
                let messageString = new TextDecoder().decode(new Uint8Array(arrayBuffer));
                console.log(`Received: ${messageString}`);

                try {
                    let messageObject = JSON.parse(messageString);
                    if (messageObject.task && this.config.taskHandlers[messageObject.task]) {
                        this.config.taskHandlers[messageObject.task](messageObject);
                    } else {
                        console.error(`No handler found for task: ${messageObject.task}`);
                    }
                } catch (error) {
                    console.error("Error processing message:", error);
                }
            });
        }
    }

    handleWebSocketClose(e) {
        if (e.wasClean) {
            console.log(`Connection closed cleanly, code=${e.code}, reason=${e.reason}`);
        } else {
            console.log('Connection died', `Close event code: ${e.code}, reason: ${e.reason}`);
        }
    }
}