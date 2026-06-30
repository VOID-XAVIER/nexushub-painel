export interface Client {
  id: string;
  name: string;
  phone: string;
  cpf: string;
  address: string;
  companyId: string;
  createdAt: string;
}

export interface DesiredProduct {
  type: string;
  model: string;
  color: string;
  size: string;
  quantity: number;
  imageUrl?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'client' | 'seller' | 'bot';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  clientId: string;
  sellerId: string | null;
  companyId: string;
  status: 'bot' | 'waiting' | 'in_service' | 'closed';
  desiredProduct: DesiredProduct | null;
  botSummary: string | null;
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
}

export type ProtocolStatus = 'iniciado' | 'andamento' | 'encerrado';
export type PaymentStatus = 'pago' | 'pendente';

export interface Protocol {
  id: string;
  code: string;
  conversationId: string;
  clientId: string;
  clientName: string;
  clientCpf: string;
  product: string;
  sellerId: string;
  companyId: string;
  status: ProtocolStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QuickMessage {
  id: string;
  text: string;
  companyId: string | null; // null = global
}
