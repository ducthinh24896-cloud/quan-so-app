import { NextResponse } from 'next/server'
import { signSession, COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/session'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { app, db } from '@/lib/firebase'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })
    }

    const auth = getAuth(app)

    // 🔍 Tìm user theo username (name)
    const q = query(
      collection(db, 'users'),
      where('name', '==', username)
    )

    const snap = await getDocs(q)

    if (snap.empty) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 })
    }

    const userDoc = snap.docs[0]
    const userData = userDoc.data()

    const email = userData.email

    // 🔐 Login bằng email thật
    const userCred = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCred.user

    // 🎯 Tạo session
    const token = await signSession({
      userId: firebaseUser.uid,
      username: userData.name, // 🔥 giờ là Bao
      role: userData.role,
      name: userData.name,
      squad: userData.squad ?? null,
    })

    const res = NextResponse.json({
      ok: true,
      name: userData.name,
      role: userData.role,
      squad: userData.squad ?? null,
    })

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    })

    return res

  } catch (err: any) {
    console.error('🔥 LOGIN ERROR:', err.code, err.message)

    return NextResponse.json({
      error: err.code + ' - ' + err.message
    }, { status: 401 })
  }
} 