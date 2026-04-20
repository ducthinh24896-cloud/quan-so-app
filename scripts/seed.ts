import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import fs from 'fs'

// ─────────────────────────────────────────
// 🔥 INIT FIREBASE ADMIN
// ─────────────────────────────────────────
const serviceAccount = JSON.parse(
  fs.readFileSync('./serviceAccountKey.json', 'utf-8')
)

initializeApp({
  credential: cert(serviceAccount),
})

const db = getFirestore()
const auth = getAuth()

// ─────────────────────────────────────────
// 📦 DATA SEED
// ─────────────────────────────────────────

const users: [string, string, string, string, number | null][] = [
  ['admin@local.com', 'admin123', 'Quản Trị Hệ Thống', 'admin', null],

  ['chihuy1@local.com', 'thinhctv', 'Thịnh', 'chihuy', null],
  ['chihuy2@local.com', 'phucddt', 'Phúc', 'chihuy', null],

  ['td9@local.com', 'hungtd9', 'Hưng', 'trungdoi', 1],
  ['td10@local.com', 'manhtd9', 'Mạnh', 'trungdoi', 2],
  ['td11@local.com', 'sontd11', 'Sơn', 'trungdoi', 3],
  ['td12@local.com', 'tutd12', 'Tú', 'trungdoi', 4],
]
const squads = [
  { id: 1, name: 'Trung đội 9', btd_total: 5, cs_total: 36 },
  { id: 2, name: 'Trung đội 10', btd_total: 5, cs_total: 36 },
  { id: 3, name: 'Trung đội 11', btd_total: 5, cs_total: 36 },
  { id: 4, name: 'Trung đội 12', btd_total: 5, cs_total: 36 },
]

// ─────────────────────────────────────────
// 👤 UPSERT USER
// ─────────────────────────────────────────
async function upsertUser(email: string, password: string) {
  try {
    return await auth.createUser({ email, password })
  } catch (err: any) {
    if (err.code === 'auth/email-already-exists') {
      return await auth.getUserByEmail(email)
    }
    throw err
  }
}

// ─────────────────────────────────────────
// 🔁 RESET (OPTIONAL)
// ─────────────────────────────────────────
async function resetAll() {
  console.log('⚠️ RESET ALL DATA...')

  const snapUsers = await auth.listUsers()
  for (const u of snapUsers.users) {
    await auth.deleteUser(u.uid)
  }

  const collections = ['users', 'squads', 'reports']
  for (const col of collections) {
    const snap = await db.collection(col).get()
    for (const doc of snap.docs) {
      await doc.ref.delete()
    }
  }

  console.log('🔥 RESET DONE')
}

// ─────────────────────────────────────────
// 🚀 SEED MAIN
// ─────────────────────────────────────────
async function seed() {
  console.log('🚀 START SEEDING...')

  // 👉 muốn reset thì bật dòng này
  await resetAll()

  // ───── USERS ─────
  console.log('\n👤 Seeding USERS...')
  for (const [email, password, name, role, squad] of users) {
    try {
      const userRecord = await upsertUser(email, password)

      await db.collection('users').doc(userRecord.uid).set({
        email,
        name,
        role,
        squad,
        updated_at: new Date(),
      }, { merge: true })

      console.log(`✅ ${email}`)
    } catch (err: any) {
      console.log(`❌ ${email}:`, err.message)
    }
  }

  // ───── SQUADS ─────
  console.log('\n🪖 Seeding SQUADS...')
  for (const sq of squads) {
    await db.collection('squads').doc(String(sq.id)).set({
      ...sq,
      updated_at: new Date(),
    }, { merge: true })

    console.log(`✅ ${sq.name}`)
  }

  // ───── CONFIG (optional) ─────
  console.log('\n⚙️ Seeding CONFIG...')

  await db.collection('config').doc('system').set({
    unit_name: 'Đại đội mẫu',
    total_squads: 4,
    created_at: new Date(),
  }, { merge: true })

  console.log('✅ Config')

  console.log('\n🔥 SEED DONE SUCCESSFULLY')
}

// ─────────────────────────────────────────
seed()

// npx ts-node scripts/seed.ts