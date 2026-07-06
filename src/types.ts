export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  pixKey?: string;
  coins: number;
  createdAt: string;
}

export type PurchaseStatus = 'Pendente' | 'Aprovado' | 'Recusado';

export interface DiamondPurchase {
  id: string;            // id do pedido (doc ID)
  userId: string;        // id_usuario
  diamonds: number;      // quantidade_dimas (e.g., 100, 200, 300, 400)
  playerFFId: string;    // id_jogador_ff
  coinsCost: number;     // coins deduzidos (cost)
  status: PurchaseStatus;// status: "Pendente", "Aprovado", "Recusado"
  date: string;          // data ("DD/MM/AAAA")
}

export type WithdrawalStatus = 'Pendente' | 'Processando' | 'Aprovado' | 'Recusado';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  date: string;
  coins: number;
  valueBRL: number;
  status: WithdrawalStatus;
  pixKey: string;
}

export interface AdBanner {
  id: string;
  title: string;
  reward: number;
  cooldownSeconds: number;
  color: string;
  borderColor: string;
  tag: string;
  sponsor: string;
  logoColor: string;
}

