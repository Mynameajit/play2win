export interface Participant {
  userId: string
  name: string
  gameUid: string
  ign: string
  phone: string
  joinedAt: string
  roomSent: boolean
}

export interface AdminUser {
  id: string
  name: string
  email: string
  assignedGame: 'BGMI' | 'Free Fire' | 'ALL'
  status: 'ACTIVE' | 'INACTIVE'
  createdDate: string
}

export interface Tournament {
  id: string
  title: string
  game: 'BGMI' | 'Free Fire'
  mode: '1v1 Duel' | 'Solo' | 'Duo' | 'Squad'
  map: string
  contestType: '1v1_DUEL' | 'SINGLE_WINNER' | 'MULTI_WINNER'
  prizePool: number
  entryFee: number
  totalSlots: number
  joinedSlots: number
  startTime: string
  status: 'LIVE' | 'UPCOMING' | 'FILLED' | 'COMPLETED' | 'RESULT_PENDING' | 'PRIZE_DISTRIBUTED' | 'ROOM_OPEN' | 'ROOM_READY' | 'CANCELLED'
  banner: string
  roomId?: string
  roomPassword?: string
  roomCredsSent?: boolean
  rules: string[]
  prizeDistribution: { rank: string; reward: string; amount: number }[]
  participants: Participant[]
  winnersDeclared?: boolean
  matchResults?: any[]
  resultsScreenshot?: string
  resultsRemarks?: string
}

export interface MatchWinnerSubmission {
  id: string
  tournamentId: string
  tournamentTitle: string
  game: 'BGMI' | 'Free Fire'
  firstPlaceUid: string
  firstPlaceIgn: string
  firstPlacePrize: number
  secondPlaceUid?: string
  secondPlaceIgn?: string
  secondPlacePrize?: number
  thirdPlaceUid?: string
  thirdPlaceIgn?: string
  thirdPlacePrize?: number
  status: 'PENDING_SUPERADMIN' | 'PAID'
  submittedAt: string
}

export interface Winner {
  id: string
  username: string
  game: 'BGMI' | 'Free Fire'
  tournamentTitle: string
  prizeWon: number
  avatar: string
  timeAgo: string
}

export interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'entry_fee' | 'winning' | 'manual_credit' | 'manual_debit' | 'refund' | 'coupon_bonus'
  title: string
  amount: number
  status: 'COMPLETED' | 'PENDING' | 'FAILED'
  date: string
  paymentMethod?: string
  utr?: string
  details?: string
  balanceBefore?: number
  balanceAfter?: number
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  unread: boolean
  type: 'tournament' | 'wallet' | 'system'
}

// REALISTIC GAME UID VERIFICATION DATABASE
export const GAME_UID_DATABASE: Record<string, { ign: string; verified: boolean; game: 'BGMI' | 'Free Fire' }> = {
  '5519820491': { ign: 'Soul_Mortal99', verified: true, game: 'BGMI' },
  '5519820499': { ign: 'GodL_Jonathan', verified: true, game: 'BGMI' },
  '5519820888': { ign: 'TX_Scout_OP', verified: true, game: 'BGMI' },
  '5519820123': { ign: 'Dynamo_Gamer_OP', verified: true, game: 'BGMI' },
  '9812739401': { ign: 'TotalGaming_Pro', verified: true, game: 'Free Fire' },
  '9812739999': { ign: 'RaiStar_FF_King', verified: true, game: 'Free Fire' },
  '9812739555': { ign: 'DesiGamer_Amit', verified: true, game: 'Free Fire' }
}

export const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'ADM-01',
    name: 'Vikram Singh (BGMI Room Admin)',
    email: 'admin@gmail.com',
    assignedGame: 'BGMI',
    status: 'ACTIVE',
    createdDate: '10 Jan 2026'
  },
  {
    id: 'ADM-02',
    name: 'Rohit Sharma (Free Fire Admin)',
    email: 'rohit@play2earn.gg',
    assignedGame: 'Free Fire',
    status: 'ACTIVE',
    createdDate: '15 Mar 2026'
  }
]

export const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: 't-bgmi-1v1-01',
    title: 'BGMI TDM 1v1 High Stakes Duel',
    game: 'BGMI',
    mode: '1v1 Duel',
    map: 'Warehouse',
    contestType: '1v1_DUEL',
    prizePool: 35,
    entryFee: 20,
    totalSlots: 2,
    joinedSlots: 2,
    startTime: 'Instant Start (When Full)',
    status: 'LIVE',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    roomId: 'BGMI-1V1-881',
    roomPassword: 'DUEL20',
    roomCredsSent: true,
    rules: [
      '1v1 TDM Warehouse Duel',
      'M416 & AKM allowed. No grenades / RPGs',
      '1st Rank Winner Takes All ₹35 (Entry ₹20 each)'
    ],
    prizeDistribution: [
      { rank: '1st Place Winner (1v1 Champion 🏆)', reward: '₹35', amount: 35 }
    ],
    participants: [
      {
        userId: 'u-1',
        name: 'Naman Mathur',
        gameUid: '5519820491',
        ign: 'Soul_Mortal99',
        phone: '+91 98765 43210',
        joinedAt: 'Today, 10:15 AM',
        roomSent: true
      },
      {
        userId: 'u-2',
        name: 'Jonathan Amaral',
        gameUid: '5519820499',
        ign: 'GodL_Jonathan',
        phone: '+91 98111 22334',
        joinedAt: 'Today, 10:18 AM',
        roomSent: true
      }
    ]
  },
  {
    id: 't-ff-1v1-01',
    title: 'Free Fire Lone Wolf 1v1 Duel',
    game: 'Free Fire',
    mode: '1v1 Duel',
    map: 'Iron Cage',
    contestType: '1v1_DUEL',
    prizePool: 90,
    entryFee: 50,
    totalSlots: 2,
    joinedSlots: 2,
    startTime: 'Instant Start (When Full)',
    status: 'LIVE',
    banner: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop',
    roomId: 'FF-1V1-509',
    roomPassword: 'FFDUEL50',
    roomCredsSent: true,
    rules: [
      '1v1 Custom Lone Wolf Match',
      'First to 5 rounds wins',
      '1st Rank Winner Takes All ₹90 (Entry ₹50 each)'
    ],
    prizeDistribution: [
      { rank: '1st Place Winner (Booyah 🏆)', reward: '₹90', amount: 90 }
    ],
    participants: [
      {
        userId: 'u-4',
        name: 'Ajayendra Sharma',
        gameUid: '9812739401',
        ign: 'TotalGaming_Pro',
        phone: '+91 97777 88899',
        joinedAt: 'Today, 11:00 AM',
        roomSent: true
      },
      {
        userId: 'u-5',
        name: 'Amit Sharma',
        gameUid: '9812739555',
        ign: 'DesiGamer_Amit',
        phone: '+91 98888 77766',
        joinedAt: 'Today, 11:05 AM',
        roomSent: true
      }
    ]
  },
  {
    id: 't-bgmi-20p-01',
    title: 'BGMI Miramar 20 Player Quick Battle',
    game: 'BGMI',
    mode: 'Solo',
    map: 'Miramar',
    contestType: 'SINGLE_WINNER',
    prizePool: 550,
    entryFee: 30,
    totalSlots: 20,
    joinedSlots: 14,
    startTime: 'Today, 6:00 PM',
    status: 'UPCOMING',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    roomId: 'SOLO-MIRA-301',
    roomPassword: 'SOLO789',
    roomCredsSent: false,
    rules: [
      '20 Players Solo Lobby',
      '1st Place Winner Takes All ₹550'
    ],
    prizeDistribution: [
      { rank: '1st Place (Winner Takes All 🏆)', reward: '₹550', amount: 550 }
    ],
    participants: [
      { userId: 'u-1', name: 'Naman Mathur', gameUid: '5519820491', ign: 'Soul_Mortal99', phone: '+91 98765 43210', joinedAt: 'Today, 10:15 AM', roomSent: false },
      { userId: 'u-2', name: 'Jonathan Amaral', gameUid: '5519820499', ign: 'GodL_Jonathan', phone: '+91 98111 22334', joinedAt: 'Today, 10:18 AM', roomSent: false },
      { userId: 'u-3', name: 'Tanmay Singh', gameUid: '5519820888', ign: 'TX_Scout_OP', phone: '+91 97654 32109', joinedAt: 'Today, 10:30 AM', roomSent: false },
      { userId: 'u-6', name: 'Aditya Sawant', gameUid: '5519820123', ign: 'Dynamo_Gamer_OP', phone: '+91 98222 33344', joinedAt: 'Today, 11:20 AM', roomSent: false },
      { userId: 'u-7', name: 'Vikas Kumar', gameUid: '5519820777', ign: 'Vikas_Sniper', phone: '+91 98333 44455', joinedAt: 'Today, 11:45 AM', roomSent: false },
      { userId: 'u-8', name: 'Rahul Verma', gameUid: '5519820555', ign: 'Rahul_Rush_OP', phone: '+91 98444 55566', joinedAt: 'Today, 12:00 PM', roomSent: false },
      { userId: 'u-9', name: 'Deepak Singh', gameUid: '5519820333', ign: 'Deepak_God_Tier', phone: '+91 98555 66677', joinedAt: 'Today, 12:15 PM', roomSent: false }
    ]
  },
  {
    id: 't-ff-50p-01',
    title: 'Free Fire Bermuda 50 Player Classic',
    game: 'Free Fire',
    mode: 'Squad',
    map: 'Bermuda',
    contestType: 'MULTI_WINNER',
    prizePool: 4500,
    entryFee: 100,
    totalSlots: 50,
    joinedSlots: 42,
    startTime: 'Tonight, 8:30 PM',
    status: 'UPCOMING',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
    roomId: 'FF-BERM-500',
    roomPassword: 'BOOYAH100',
    roomCredsSent: false,
    rules: [
      '50 Players Classic Lobby',
      '1st Place Booyah: ₹2,250 | 2nd: ₹1,350 | 3rd: ₹900'
    ],
    prizeDistribution: [
      { rank: '1st Place (Booyah!)', reward: '₹2,250', amount: 2250 },
      { rank: '2nd Place', reward: '₹1,350', amount: 1350 },
      { rank: '3rd Place', reward: '₹900', amount: 900 }
    ],
    participants: [
      { userId: 'u-4', name: 'Ajayendra Sharma', gameUid: '9812739401', ign: 'TotalGaming_Pro', phone: '+91 97777 88899', joinedAt: 'Today, 11:00 AM', roomSent: false },
      { userId: 'u-5', name: 'Amit Sharma', gameUid: '9812739555', ign: 'DesiGamer_Amit', phone: '+91 98888 77766', joinedAt: 'Today, 11:05 AM', roomSent: false },
      { userId: 'u-10', name: 'Rai Star', gameUid: '9812739999', ign: 'RaiStar_FF_King', phone: '+91 97111 22233', joinedAt: 'Today, 11:30 AM', roomSent: false },
      { userId: 'u-11', name: 'Gyan Sujan', gameUid: '9812739111', ign: 'Gyan_Gaming_OP', phone: '+91 97222 33344', joinedAt: 'Today, 12:00 PM', roomSent: false },
      { userId: 'u-12', name: 'Lokesh Gamer', gameUid: '9812739222', ign: 'Lokesh_Diamonds', phone: '+91 97333 44455', joinedAt: 'Today, 12:30 PM', roomSent: false }
    ]
  },
  {
    id: 't-bgmi-100p-01',
    title: 'BGMI Erangel 100 Player Mega Cup',
    game: 'BGMI',
    mode: 'Squad',
    map: 'Erangel',
    contestType: 'MULTI_WINNER',
    prizePool: 18000,
    entryFee: 200,
    totalSlots: 100,
    joinedSlots: 88,
    startTime: 'Today, 9:00 PM',
    status: 'UPCOMING',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
    roomId: 'P2E-BGMI-8821',
    roomPassword: 'WINNER789',
    roomCredsSent: true,
    rules: [
      '100 Players Full Lobby',
      '1st: ₹9,000 | 2nd: ₹5,000 | 3rd: ₹4,000'
    ],
    prizeDistribution: [
      { rank: '1st Place Winner', reward: '₹9,000', amount: 9000 },
      { rank: '2nd Place Runner Up', reward: '₹5,000', amount: 5000 },
      { rank: '3rd Place', reward: '₹4,000', amount: 4000 }
    ],
    participants: [
      { userId: 'u-1', name: 'Naman Mathur', gameUid: '5519820491', ign: 'Soul_Mortal99', phone: '+91 98765 43210', joinedAt: 'Today, 10:15 AM', roomSent: true },
      { userId: 'u-2', name: 'Jonathan Amaral', gameUid: '5519820499', ign: 'GodL_Jonathan', phone: '+91 98111 22334', joinedAt: 'Today, 10:18 AM', roomSent: true },
      { userId: 'u-3', name: 'Tanmay Singh', gameUid: '5519820888', ign: 'TX_Scout_OP', phone: '+91 97654 32109', joinedAt: 'Today, 10:30 AM', roomSent: true },
      { userId: 'u-6', name: 'Aditya Sawant', gameUid: '5519820123', ign: 'Dynamo_Gamer_OP', phone: '+91 98222 33344', joinedAt: 'Today, 11:20 AM', roomSent: true }
    ]
  }
]

export const MOCK_WINNERS: Winner[] = [
  {
    id: 'w-1',
    username: 'Soul_Mortal99',
    game: 'BGMI',
    tournamentTitle: 'BGMI 1v1 High Stakes Duel',
    prizeWon: 35,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Mortal',
    timeAgo: '15 mins ago'
  },
  {
    id: 'w-2',
    username: 'TotalGaming_Pro',
    game: 'Free Fire',
    tournamentTitle: 'Free Fire Lone Wolf 1v1',
    prizeWon: 90,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ajjubhai',
    timeAgo: '42 mins ago'
  }
]

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-99812',
    type: 'deposit',
    title: 'UPI Top Up (Google Pay)',
    amount: 500,
    status: 'COMPLETED',
    date: '21 Jul 2026, 11:20 AM',
    paymentMethod: 'UPI - GPay'
  },
  {
    id: 'TXN-99805',
    type: 'entry_fee',
    title: 'Entry Fee: BGMI 1v1 High Stakes Duel',
    amount: 20,
    status: 'COMPLETED',
    date: '21 Jul 2026, 10:15 AM'
  }
]

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'Room Credentials Dispatched! 🎮',
    message: 'Admin has dispatched Room ID & Password for BGMI 1v1 Duel to your registered UID.',
    time: '5 mins ago',
    unread: true,
    type: 'tournament'
  }
]

export const INITIAL_WINNER_SUBMISSIONS: MatchWinnerSubmission[] = [
  {
    id: 'SUB-101',
    tournamentId: 't-bgmi-1v1-01',
    tournamentTitle: 'BGMI TDM 1v1 High Stakes Duel',
    game: 'BGMI',
    firstPlaceUid: '5519820491',
    firstPlaceIgn: 'Soul_Mortal99',
    firstPlacePrize: 35,
    status: 'PENDING_SUPERADMIN',
    submittedAt: 'Today, 11:30 AM'
  }
]

export const ADMIN_WITHDRAWAL_REQUESTS = [
  {
    id: 'REQ-101',
    userName: 'Ajay_BGMI_Pro',
    uid: '5519827419',
    amount: 1500,
    upiId: 'ajaypro@okicici',
    requestedAt: '21 Jul 2026, 10:30 AM',
    status: 'PENDING'
  }
]
