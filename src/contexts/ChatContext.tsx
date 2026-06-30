import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import {
  Client,
  Conversation,
  Message,
  Protocol,
  QuickMessage,
  DesiredProduct,
} from '../types/chat';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';

interface ConvRow {
  id: string;
  client_phone: string;
  company_id: string;
  seller_id: string | null;
  status: string;
  collected_data: Record<string, string> | null;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
}

interface MsgRow {
  id: string;
  conversation_id: string;
  sender: string;
  text: string;
  created_at: string;
}

interface ProtRow {
  id: string;
  code: string;
  conversation_id: string;
  client_phone: string;
  client_name: string | null;
  client_cpf: string | null;
  product: string | null;
  seller_id: string | null;
  company_id: string;
  status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  sellerId: string;
  companyId: string;
  clientId: string;
  protocolCode: string;
  amount: number;
  createdAt: string;
}

interface ChatContextType {
  clients: Client[];
  getClient: (id: string) => Client | undefined;
  getActiveClientsCount: (companyId: string) => number;
  conversations: Conversation[];
  getConversation: (id: string) => Conversation | undefined;
  getConversationsByCompany: (companyId: string) => Conversation[];
  getConversationsBySeller: (sellerId: string) => Conversation[];
  assignConversation: (conversationId: string, sellerId: string) => { success: boolean; error?: string };
  closeConversation: (conversationId: string) => void;
  releaseConversation: (conversationId: string) => void;
  isClientBeingServed: (clientId: string) => boolean;
  getActiveConversationForClient: (clientId: string) => Conversation | undefined;
  messages: Message[];
  getMessagesByConversation: (conversationId: string) => Message[];
  sendMessage: (conversationId: string, senderId: string, senderType: 'seller', content: string) => void;
  protocols: Protocol[];
  getProtocol: (code: string) => Protocol | undefined;
  getProtocolsByCompany: (companyId: string) => Protocol[];
  createProtocol: (data: {
    conversationId: string;
    clientId: string;
    clientName: string;
    clientCpf: string;
    product: string;
    sellerId: string;
    companyId: string;
  }) => Protocol;
  updateProtocolStatus: (code: string, status: Protocol['status']) => void;
  updatePaymentStatus: (code: string, paymentStatus: Protocol['paymentStatus']) => void;
  quickMessages: QuickMessage[];
  sales: Sale[];
  getSalesByCompany: (companyId: string) => Sale[];
  getSalesBySeller: (sellerId: string) => Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

const STATIC_QUICK_MESSAGES: QuickMessage[] = [
  { id: 'qm-1', text: 'Olá, vou te atender 😊', companyId: null },
  { id: 'qm-2', text: 'Vou verificar no estoque', companyId: null },
  { id: 'qm-3', text: 'Pode confirmar o pedido?', companyId: null },
  { id: 'qm-4', text: 'Qual o seu CEP para calcular o frete?', companyId: null },
  { id: 'qm-5', text: 'Pagamento confirmado! ✅', companyId: null },
  { id: 'qm-6', text: 'Pedido enviado, acompanhe pelo rastreio 📦', companyId: null },
];

function makeClientFromRow(row: ConvRow): Client {
  const cd = row.collected_data ?? {};
  return {
    id: row.client_phone,
    name: cd['nome'] ?? cd['name'] ?? cd['cliente'] ?? `Cliente ${row.client_phone}`,
    phone: row.client_phone,
    cpf: cd['cpf'] ?? cd['documento'] ?? '-',
    address: cd['endereco'] ?? cd['address'] ?? cd['rua'] ?? '-',
    companyId: row.company_id,
    createdAt: row.created_at,
  };
}

function makeDesiredProduct(cd: Record<string, string>): DesiredProduct | null {
  const type  = cd['tipo']    ?? cd['type']     ?? cd['produto']   ?? cd['product'] ?? null;
  const model = cd['modelo']  ?? cd['model']    ?? cd['item']      ?? null;
  const color = cd['cor']     ?? cd['color']    ?? null;
  const size  = cd['tamanho'] ?? cd['size']     ?? cd['numeracao'] ?? null;
  const qty   = parseInt(cd['quantidade'] ?? cd['quantity'] ?? '1') || 1;
  if (!type && !model) return null;
  return {
    type:     type     ?? 'Não especificado',
    model:    model    ?? 'Não especificado',
    color:    color    ?? 'Não especificado',
    size:     size     ?? 'Não especificado',
    quantity: qty,
  };
}

const STATUS_MAP: Record<string, Conversation['status']> = {
  bot:        'bot',
  waiting:    'waiting',
  active:     'in_service',
  in_service: 'in_service',
  closed:     'closed',
};

function mapConversation(row: ConvRow): Conversation {
  return {
    id: row.id,
    clientId: row.client_phone,
    sellerId: row.seller_id ?? null,
    companyId: row.company_id,
    status: STATUS_MAP[row.status] ?? 'waiting',
    desiredProduct: makeDesiredProduct(row.collected_data ?? {}),
    botSummary: row.collected_data ? JSON.stringify(row.collected_data) : null,
    lastMessage: row.last_message ?? '',
    lastMessageAt: row.last_message_at ?? row.created_at,
    createdAt: row.created_at,
  };
}

function mapMessage(row: MsgRow): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender === 'client' ? row.conversation_id : 'bot-or-seller',
    senderType: row.sender === 'client' ? 'client' : row.sender === 'bot' ? 'bot' : 'seller',
    content: row.text ?? '',
    timestamp: row.created_at,
  };
}

function mapProtocol(row: ProtRow): Protocol {
  return {
    id: row.id,
    code: row.code,
    conversationId: row.conversation_id,
    clientId: row.client_phone,
    clientName: row.client_name ?? '-',
    clientCpf: row.client_cpf ?? '-',
    product: row.product ?? '-',
    sellerId: row.seller_id ?? '',
    companyId: row.company_id,
    status: (row.status as Protocol['status']) ?? 'andamento',
    paymentStatus: (row.payment_status as Protocol['paymentStatus']) ?? 'pendente',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { users } = useData();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [clients, setClients]             = useState<Client[]>([]);
  const [messages, setMessages]           = useState<Message[]>([]);
  const [protocols, setProtocols]         = useState<Protocol[]>([]);
  const [sales, setSales]                 = useState<Sale[]>([]);

  const currentUserData = users.find((u: { id: string }) => u.id === user?.id);
  const userCompanyId   = currentUserData?.companyId ?? null;
  const isRoot          = user?.role === 'master_root' || user?.role === 'master_staff';

  const loadConversations = useCallback(async () => {
    if (!user) return;
    let q = supabase
      .from('conversations')
      .select('*')
      .neq('status', 'closed')
      .order('last_message_at', { ascending: false });
    if (!isRoot && userCompanyId) q = q.eq('company_id', userCompanyId);
    const { data, error } = await q;
    if (error) { console.error('loadConversations:', error.message); return; }
    const rows = (data ?? []) as ConvRow[];
    setConversations(rows.map(mapConversation));
    const clientMap = new Map<string, Client>();
    rows.forEach(row => {
      if (!clientMap.has(row.client_phone)) clientMap.set(row.client_phone, makeClientFromRow(row));
    });
    setClients(Array.from(clientMap.values()));
  }, [user, isRoot, userCompanyId]);

  const loadMessages = useCallback(async () => {
    if (!user) return;
    let cq = supabase.from('conversations').select('id').neq('status', 'closed');
    if (!isRoot && userCompanyId) cq = cq.eq('company_id', userCompanyId);
    const { data: convIds } = await cq;
    if (!convIds?.length) return;
    const ids = (convIds as { id: string }[]).map(c => c.id);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .in('conversation_id', ids)
      .order('created_at', { ascending: true });
    if (error) { console.error('loadMessages:', error.message); return; }
    setMessages(((data ?? []) as MsgRow[]).map(mapMessage));
  }, [user, isRoot, userCompanyId]);

  const loadProtocols = useCallback(async () => {
    if (!user) return;
    let q = supabase.from('protocols').select('*').order('created_at', { ascending: false });
    if (!isRoot && userCompanyId) q = q.eq('company_id', userCompanyId);
    const { data, error } = await q;
    if (error) { console.error('loadProtocols:', error.message); return; }
    setProtocols(((data ?? []) as ProtRow[]).map(mapProtocol));
  }, [user, isRoot, userCompanyId]);

  useEffect(() => {
    loadConversations();
    loadMessages();
    loadProtocols();
  }, [loadConversations, loadMessages, loadProtocols]);

  useEffect(() => {
    if (!user) return;
    const ch1 = supabase
      .channel('chat-conversations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        loadConversations();
      })
      .subscribe();
    const ch2 = supabase
      .channel('chat-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload: { new: MsgRow }) => {
          const newMsg = mapMessage(payload.new);
          setMessages(prev => prev.find(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
        }
      )
      .subscribe();
    const ch3 = supabase
      .channel('chat-protocols')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'protocols' }, () => {
        loadProtocols();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch1);
      supabase.removeChannel(ch2);
      supabase.removeChannel(ch3);
    };
  }, [user, loadConversations, loadProtocols]);

  const getClient = useCallback((id: string) =>
    clients.find(c => c.id === id), [clients]);

  const getActiveClientsCount = useCallback((companyId: string) => {
    const active = conversations.filter(
      c => c.companyId === companyId && (c.status === 'in_service' || c.status === 'waiting')
    );
    return new Set(active.map(c => c.clientId)).size;
  }, [conversations]);

  const isClientBeingServed = useCallback((clientId: string) =>
    conversations.some(c => c.clientId === clientId && c.status === 'in_service'),
  [conversations]);

  const getActiveConversationForClient = useCallback((clientId: string) =>
    conversations.find(c => c.clientId === clientId && (c.status === 'in_service' || c.status === 'waiting')),
  [conversations]);

  const getConversation = useCallback((id: string) =>
    conversations.find(c => c.id === id), [conversations]);

  const getConversationsByCompany = useCallback((companyId: string) =>
    conversations.filter(c => c.companyId === companyId), [conversations]);

  const getConversationsBySeller = useCallback((sellerId: string) =>
    conversations.filter(c => c.sellerId === sellerId || c.sellerId === null), [conversations]);

  const assignConversation = useCallback((conversationId: string, sellerId: string): { success: boolean; error?: string } => {
    const conv = conversations.find(c => c.id === conversationId);
    if (!conv) return { success: false, error: 'Conversa não encontrada.' };
    if (conv.sellerId && conv.sellerId !== sellerId && conv.status === 'in_service')
      return { success: false, error: 'Este cliente já está sendo atendido por outro vendedor.' };
    const otherActive = conversations.find(
      c => c.clientId === conv.clientId && c.id !== conversationId &&
           c.status === 'in_service' && c.sellerId !== sellerId
    );
    if (otherActive)
      return { success: false, error: 'Este cliente já possui um atendimento ativo com outro vendedor.' };
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, sellerId, status: 'in_service' as const } : c
    ));
    supabase.from('conversations')
      .update({ status: 'active', seller_id: sellerId })
      .eq('id', conversationId)
      .then(({ error }) => { if (error) { console.error(error.message); loadConversations(); } });
    return { success: true };
  }, [conversations, loadConversations]);

  const closeConversation = useCallback((conversationId: string) => {
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, status: 'closed' as const, sellerId: null } : c
    ));
    supabase.from('conversations').update({ status: 'closed' }).eq('id', conversationId);
  }, []);

  const releaseConversation = useCallback((conversationId: string) => {
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, status: 'waiting' as const, sellerId: null } : c
    ));
    supabase.from('conversations').update({ status: 'waiting', seller_id: null }).eq('id', conversationId);
  }, []);

  const getMessagesByConversation = useCallback((conversationId: string) =>
    messages.filter(m => m.conversationId === conversationId), [messages]);

  const sendMessage = useCallback((
    conversationId: string,
    senderId: string,
    senderType: 'seller',
    content: string
  ) => {
    const id  = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const newMsg: Message = { id, conversationId, senderId, senderType, content, timestamp: now };
    setMessages(prev => [...prev, newMsg]);
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, lastMessage: content, lastMessageAt: now } : c
    ));
    supabase.from('messages').insert({ id, conversation_id: conversationId, sender: 'seller', text: content, created_at: now });
    supabase.from('conversations').update({ last_message: content, last_message_at: now }).eq('id', conversationId);
  }, []);

  const getProtocol = useCallback((code: string) =>
    protocols.find(p => p.code === code), [protocols]);

  const getProtocolsByCompany = useCallback((companyId: string) =>
    protocols.filter(p => p.companyId === companyId), [protocols]);

  const createProtocol = useCallback((data: {
    conversationId: string; clientId: string; clientName: string;
    clientCpf: string; product: string; sellerId: string; companyId: string;
  }): Protocol => {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const now  = new Date().toISOString();
    const id   = `prot-${Date.now()}`;
    const newProtocol: Protocol = { id, code, ...data, status: 'andamento', paymentStatus: 'pendente', createdAt: now, updatedAt: now };
    setProtocols(prev => [...prev, newProtocol]);
    supabase.from('protocols').insert({
      id, code,
      conversation_id: data.conversationId,
      client_phone:    data.clientId,
      client_name:     data.clientName,
      client_cpf:      data.clientCpf,
      product:         data.product,
      seller_id:       data.sellerId,
      company_id:      data.companyId,
      status:          'andamento',
      payment_status:  'pendente',
      created_at:      now,
      updated_at:      now,
    });
    return newProtocol;
  }, []);

  const updateProtocolStatus = useCallback((code: string, status: Protocol['status']) => {
    const now = new Date().toISOString();
    setProtocols(prev => prev.map(p => p.code === code ? { ...p, status, updatedAt: now } : p));
    supabase.from('protocols').update({ status, updated_at: now }).eq('code', code);
  }, []);

  const updatePaymentStatus = useCallback((code: string, paymentStatus: Protocol['paymentStatus']) => {
    const now = new Date().toISOString();
    setProtocols(prev => prev.map(p => p.code === code ? { ...p, paymentStatus, updatedAt: now } : p));
    supabase.from('protocols').update({ payment_status: paymentStatus, updated_at: now }).eq('code', code);
  }, []);

  const getSalesByCompany = useCallback((companyId: string) =>
    sales.filter(s => s.companyId === companyId), [sales]);

  const getSalesBySeller = useCallback((sellerId: string) =>
    sales.filter(s => s.sellerId === sellerId), [sales]);

  const addSale = useCallback((sale: Omit<Sale, 'id' | 'createdAt'>) => {
    setSales(prev => [...prev, { ...sale, id: `sale-${Date.now()}`, createdAt: new Date().toISOString() }]);
  }, []);

  return (
    <ChatContext.Provider value={{
      clients, getClient, getActiveClientsCount,
      conversations, getConversation, getConversationsByCompany, getConversationsBySeller,
      assignConversation, closeConversation, releaseConversation,
      isClientBeingServed, getActiveConversationForClient,
      messages, getMessagesByConversation, sendMessage,
      protocols, getProtocol, getProtocolsByCompany,
      createProtocol, updateProtocolStatus, updatePaymentStatus,
      quickMessages: STATIC_QUICK_MESSAGES,
      sales, getSalesByCompany, getSalesBySeller, addSale,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
}