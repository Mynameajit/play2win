import { Pool } from 'pg'

// Global type declaration for hot-reloads in Next.js development
const globalRef = global as any

let pool: Pool | null = null

if (process.env.DATABASE_URL) {
  if (!globalRef.pgPool) {
    globalRef.pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
        rejectUnauthorized: false
      }
    })
  }
  pool = globalRef.pgPool
}

export interface DbUser {
  id?: number
  username: string
  email: string
  password_hash: string
  phone: string
  role: 'user' | 'admin' | 'superadmin'
  bgmi_uid: string
  bgmi_ign: string
  freefire_uid: string
  freefire_ign: string
  deposit_balance: number
  winning_balance: number
  total_kills: number
  matches_played: number
  rank_title: string
  created_at?: Date
}

// In-Memory fallback database when DATABASE_URL is not set
let mockUsers: DbUser[] = [
  {
    id: 1,
    username: 'mortal_sniper',
    email: 'user@gmail.com',
    password_hash: '123456', // storing plain for simple demo, but in production we can use hashing or plain simple checks
    phone: '+91 98765 43210',
    role: 'user',
    bgmi_uid: '5519820491',
    bgmi_ign: 'Soul_Mortal99',
    freefire_uid: '9812739401',
    freefire_ign: 'TotalGaming_Pro',
    deposit_balance: 450,
    winning_balance: 12850,
    total_kills: 142,
    matches_played: 38,
    rank_title: 'Conqueror Tier I'
  },
  {
    id: 2,
    username: 'bgmi_admin',
    email: 'admin@gmail.com',
    password_hash: '123456',
    phone: '+91 99999 88888',
    role: 'admin',
    bgmi_uid: '111111111',
    bgmi_ign: 'Admin_Vikram',
    freefire_uid: '',
    freefire_ign: '',
    deposit_balance: 0,
    winning_balance: 0,
    total_kills: 0,
    matches_played: 0,
    rank_title: 'Server Admin'
  },
  {
    id: 3,
    username: 'super_admin',
    email: 'superadmin@gmail.com',
    password_hash: '123456',
    phone: '+91 99999 99999',
    role: 'superadmin',
    bgmi_uid: '222222222',
    bgmi_ign: 'SuperAdmin_Enterprise',
    freefire_uid: '',
    freefire_ign: '',
    deposit_balance: 100000,
    winning_balance: 100000,
    total_kills: 0,
    matches_played: 0,
    rank_title: 'Platform Director'
  }
]

let mockOtps: { email: string; otp: string; expires_at: Date }[] = []

// DB UTILITIES
export async function query(text: string, params?: any[]) {
  if (pool) {
    return pool.query(text, params)
  }
  throw new Error('Database not connected. Running in fallback mode.')
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const cleanEmail = email.trim().toLowerCase()
  if (pool) {
    const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1', [cleanEmail])
    if (res.rows.length > 0) {
      const u = res.rows[0]
      return {
        id: u.id,
        username: u.username,
        email: u.email,
        password_hash: u.password,
        phone: u.phone,
        role: u.role,
        bgmi_uid: u.bgmi_uid || '',
        bgmi_ign: u.bgmi_ign || '',
        freefire_uid: u.freefire_uid || '',
        freefire_ign: u.freefire_ign || '',
        deposit_balance: Number(u.deposit_balance || 0),
        winning_balance: Number(u.winning_balance || 0),
        total_kills: Number(u.total_kills || 0),
        matches_played: Number(u.matches_played || 0),
        rank_title: u.rank_title || 'Novice',
        created_at: u.created_at
      }
    }
    return null
  } else {
    const found = mockUsers.find(u => u.email.toLowerCase() === cleanEmail)
    return found ? { ...found } : null
  }
}

export async function findUserByUsername(username: string): Promise<DbUser | null> {
  const cleanUsername = username.trim().toLowerCase()
  if (pool) {
    const res = await pool.query('SELECT * FROM users WHERE LOWER(username) = $1 LIMIT 1', [cleanUsername])
    if (res.rows.length > 0) {
      const u = res.rows[0]
      return {
        id: u.id,
        username: u.username,
        email: u.email,
        password_hash: u.password,
        phone: u.phone,
        role: u.role,
        bgmi_uid: u.bgmi_uid || '',
        bgmi_ign: u.bgmi_ign || '',
        freefire_uid: u.freefire_uid || '',
        freefire_ign: u.freefire_ign || '',
        deposit_balance: Number(u.deposit_balance || 0),
        winning_balance: Number(u.winning_balance || 0),
        total_kills: Number(u.total_kills || 0),
        matches_played: Number(u.matches_played || 0),
        rank_title: u.rank_title || 'Novice',
        created_at: u.created_at
      }
    }
    return null
  } else {
    const found = mockUsers.find(u => u.username.toLowerCase() === cleanUsername)
    return found ? { ...found } : null
  }
}

export async function createUser(userData: Omit<DbUser, 'id' | 'deposit_balance' | 'winning_balance' | 'total_kills' | 'matches_played' | 'rank_title'>): Promise<DbUser> {
  const newUser: DbUser = {
    username: userData.username.trim(),
    email: userData.email.trim().toLowerCase(),
    password_hash: userData.password_hash,
    phone: userData.phone,
    role: userData.role || 'user',
    bgmi_uid: '',
    bgmi_ign: '',
    freefire_uid: '',
    freefire_ign: '',
    deposit_balance: 0,
    winning_balance: 0,
    total_kills: 0,
    matches_played: 0,
    rank_title: 'Bronze Tier I'
  }

  if (pool) {
    const res = await pool.query(
      `INSERT INTO users (
        username, email, password, phone, role, 
        bgmi_uid, bgmi_ign, freefire_uid, freefire_ign, 
        deposit_balance, winning_balance, total_kills, matches_played, rank_title
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        newUser.username, newUser.email, newUser.password_hash, newUser.phone, newUser.role,
        newUser.bgmi_uid, newUser.bgmi_ign, newUser.freefire_uid, newUser.freefire_ign,
        newUser.deposit_balance, newUser.winning_balance, newUser.total_kills, newUser.matches_played, newUser.rank_title
      ]
    )
    const u = res.rows[0]
    return {
      id: u.id,
      username: u.username,
      email: u.email,
      password_hash: u.password,
      phone: u.phone,
      role: u.role,
      bgmi_uid: u.bgmi_uid || '',
      bgmi_ign: u.bgmi_ign || '',
      freefire_uid: u.freefire_uid || '',
      freefire_ign: u.freefire_ign || '',
      deposit_balance: Number(u.deposit_balance || 0),
      winning_balance: Number(u.winning_balance || 0),
      total_kills: Number(u.total_kills || 0),
      matches_played: Number(u.matches_played || 0),
      rank_title: u.rank_title || 'Bronze Tier I',
      created_at: u.created_at
    }
  } else {
    newUser.id = mockUsers.length + 1
    newUser.created_at = new Date()
    mockUsers.push(newUser)
    return { ...newUser }
  }
}

export async function storeOtp(email: string, otp: string, expiresAt: Date): Promise<void> {
  const cleanEmail = email.trim().toLowerCase()
  if (pool) {
    // Delete any old OTPs for this email first
    await pool.query('DELETE FROM otps WHERE email = $1', [cleanEmail])
    await pool.query('INSERT INTO otps (email, otp, expires_at) VALUES ($1, $2, $3)', [cleanEmail, otp, expiresAt])
  } else {
    mockOtps = mockOtps.filter(o => o.email.toLowerCase() !== cleanEmail)
    mockOtps.push({ email: cleanEmail, otp, expires_at: expiresAt })
  }
}

export async function verifyAndConsumeOtp(email: string, otp: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase()
  const cleanOtp = otp.trim()
  const now = new Date()

  if (pool) {
    const res = await pool.query(
      'SELECT * FROM otps WHERE email = $1 AND otp = $2 AND expires_at > $3 ORDER BY created_at DESC LIMIT 1',
      [cleanEmail, cleanOtp, now]
    )
    if (res.rows.length > 0) {
      // OTP is valid, consume it by deleting
      await pool.query('DELETE FROM otps WHERE email = $1', [cleanEmail])
      return true
    }
    return false
  } else {
    const foundIdx = mockOtps.findIndex(
      o => o.email.toLowerCase() === cleanEmail && o.otp === cleanOtp && o.expires_at > now
    )
    if (foundIdx !== -1) {
      mockOtps.splice(foundIdx, 1)
      return true
    }
    return false
  }
}

export async function updateUserPassword(email: string, newPasswordHash: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase()
  if (pool) {
    const res = await pool.query('UPDATE users SET password = $1 WHERE email = $2', [newPasswordHash, cleanEmail])
    return (res.rowCount ?? 0) > 0
  } else {
    const user = mockUsers.find(u => u.email.toLowerCase() === cleanEmail)
    if (user) {
      user.password_hash = newPasswordHash
      return true
    }
    return false
  }
}
