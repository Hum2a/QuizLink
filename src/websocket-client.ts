export interface WebSocketMessage {
  type: string;
  payload?: any;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private roomCode: string;
  private wsUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers: Map<string, (payload: any) => void> = new Map();

  constructor(wsUrl: string, roomCode: string) {
    this.wsUrl = wsUrl;
    this.roomCode = roomCode;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = `${this.wsUrl}/game/${this.roomCode}`;
        console.log('Connecting to:', url);

        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('WebSocket connected, readyState:', this.ws?.readyState);
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = event => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            console.log('Received WebSocket message:', message);
            const handler = this.messageHandlers.get(message.type);
            if (handler) {
              handler(message.payload);
            } else {
              // Try catch-all handler
              const catchAllHandler = this.messageHandlers.get('*');
              if (catchAllHandler) {
                catchAllHandler(message);
              }
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };

        this.ws.onerror = error => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  on(eventType: string, handler: (payload: any) => void) {
    this.messageHandlers.set(eventType, handler);
  }

  emit(eventType: string, payload?: any) {
    console.log(
      'Emitting event:',
      eventType,
      'WebSocket state:',
      this.ws?.readyState
    );
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: eventType,
        payload,
      };
      console.log('Sending message:', message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.error(
        'WebSocket not connected, readyState:',
        this.ws?.readyState
      );
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);

      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    const connected = this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    console.log('isConnected check:', {
      ws: !!this.ws,
      readyState: this.ws?.readyState,
      connected,
    });
    return connected;
  }

  getReadyState(): number | undefined {
    return this.ws?.readyState;
  }
}
