export interface IpData {
  localIp: string | null;
  publicIp: string | null;
  loading: boolean;
  error: string | null;
}

export interface NetworkInsight {
  type: 'security' | 'fact' | 'technical';
  content: string;
}

export enum Tab {
  HOME = 'HOME',
  INSIGHTS = 'INSIGHTS',
  SETTINGS = 'SETTINGS'
}