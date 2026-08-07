import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

export interface FinancialOverview {
  totalDeposit: number;
  todayDeposit: number;
  pendingDeposit: number;
  rejectedDeposit: number;
  totalWithdraw: number;
  todayWithdraw: number;
  pendingWithdraw: number;
  rejectedWithdraw: number;
  totalEntryFee: number;
  todayEntryFee: number;
  totalWinning: number;
  todayWinning: number;
  platformProfit: number;
  platformRevenue: number;
}

export interface WalletAnalytics {
  totalDepositBalance: number;
  totalWinningBalance: number;
  totalBonusBalance: number;
  totalLockedBalance: number;
  totalWalletBalance: number;
}

export interface PendingActions {
  pendingDeposits: number;
  pendingWithdraws: number;
  pendingResults: number;
  pendingTickets: number;
}

export interface UserAnalytics {
  highestDepositor: { username: string; amount: number } | null;
  highestWinner: { username: string; amount: number } | null;
  highestWithdraw: { username: string; amount: number } | null;
  mostActiveUser: { username: string; matchesPlayed: number } | null;
}

export interface TournamentAnalyticsData {
  id: string;
  title: string;
  playersJoined: number;
  entryCollection: number;
  prizeDistributed: number;
  platformProfit: number;
}

export interface ChartDataPoint {
  date: string;
  deposit: number;
  withdraw: number;
  revenue: number;
  winning: number;
}

export interface FinancialAnalyticsResponse {
  financialOverview: FinancialOverview;
  walletAnalytics: WalletAnalytics;
  pendingActions: PendingActions;
  userAnalytics: UserAnalytics;
  tournamentAnalytics: TournamentAnalyticsData[];
  chartData: ChartDataPoint[];
}

export function useFinancialAnalytics() {
  return useQuery<FinancialAnalyticsResponse, Error>({
    queryKey: ['superAdmin', 'financialAnalytics'],
    queryFn: async () => {
      const response = await apiClient.get('/superadmin/analytics/financial');
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
