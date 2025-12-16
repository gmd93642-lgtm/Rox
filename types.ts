export enum MessageSender {
  USER = 'USER',
  SYSTEM = 'SYSTEM'
}

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: number;
}

export interface SystemMetrics {
  cpu: number;
  ram: number;
  temp: number;
  network: number;
  battery: number;
}

export enum AppMode {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  PROCESSING = 'PROCESSING',
  SPEAKING = 'SPEAKING',
  VISION = 'VISION',
  LOCKED = 'LOCKED'
}

export interface Command {
  intent: string;
  action: string;
  confidence: number;
}