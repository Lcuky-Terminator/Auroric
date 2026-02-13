import { NextResponse } from 'next/server';
import { getUserByUsername, getUserByEmail, createUser, type ServerUser } from '@/lib/db';
import { hashPassword, createToken, COOKIE_NAME, COOKIE_OPTIONS } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, displayName, email, password } = await request.json();

    if (!username || !displayName || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    if (await getUserByUsername(username)) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    if (await getUserByEmail(email)) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const serverUser: ServerUser = {
      id: `user-${Date.now()}`,
      username,
      displayName,
      email,
      passwordHash: hashPassword(password),
      bio: '',
      avatar: '',
      website: '',
      followers: [],
      following: [],
      createdAt: new Date().toISOString(),
      settings: {
        privateProfile: false,
        showActivity: true,
        allowMessages: true,
        allowNotifications: true,
        emailOnNewFollower: true,
        emailOnPinInteraction: true,
        theme: 'dark',
      },
    };

    const user = await createUser(serverUser);
    const token = await createToken(user.id);
    const response = NextResponse.json({ user });
    response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
    return response;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
