import { ID, Query } from 'node-appwrite';
import { databases, DB_ID, USERS_COL, PINS_COL, BOARDS_COL, NOTIFICATIONS_COL } from './appwrite';
import type { User, Pin, Board, Comment, Notification, UserSettings, PaginatedResult } from './types';

// ── Types ──

export interface ServerUser extends User {
  passwordHash: string;
}

export type SafeUser = User;

// ── Document ↔ Model converters ──

function docToUser(doc: any): ServerUser {
  return {
    id: doc.$id,
    username: doc.username,
    displayName: doc.displayName,
    email: doc.email,
    bio: doc.bio || '',
    avatar: doc.avatar || '',
    website: doc.website || '',
    passwordHash: doc.passwordHash,
    followers: jsonParse(doc.followersJson),
    following: jsonParse(doc.followingJson),
    createdAt: doc.createdAt,
    settings: {
      privateProfile: doc.settingsPrivateProfile ?? false,
      showActivity: doc.settingsShowActivity ?? true,
      allowMessages: doc.settingsAllowMessages ?? true,
      allowNotifications: doc.settingsAllowNotifications ?? true,
      emailOnNewFollower: doc.settingsEmailOnNewFollower ?? false,
      emailOnPinInteraction: doc.settingsEmailOnPinInteraction ?? false,
      theme: (doc.settingsTheme as 'dark' | 'light') || 'dark',
    },
  };
}

function userToDoc(u: ServerUser): Record<string, any> {
  return {
    username: u.username,
    displayName: u.displayName,
    email: u.email,
    bio: u.bio,
    avatar: u.avatar,
    website: u.website,
    passwordHash: u.passwordHash,
    followersJson: JSON.stringify(u.followers),
    followingJson: JSON.stringify(u.following),
    createdAt: u.createdAt,
    settingsPrivateProfile: u.settings.privateProfile,
    settingsShowActivity: u.settings.showActivity,
    settingsAllowMessages: u.settings.allowMessages,
    settingsAllowNotifications: u.settings.allowNotifications,
    settingsEmailOnNewFollower: u.settings.emailOnNewFollower,
    settingsEmailOnPinInteraction: u.settings.emailOnPinInteraction,
    settingsTheme: u.settings.theme,
  };
}

function docToPin(doc: any): Pin {
  return {
    id: doc.$id,
    title: doc.title,
    description: doc.description || '',
    imageUrl: doc.imageUrl,
    sourceUrl: doc.sourceUrl || '',
    authorId: doc.authorId,
    boardId: doc.boardId || undefined,
    tags: jsonParse(doc.tagsJson),
    category: doc.category || 'All',
    likes: jsonParse(doc.likesJson),
    saves: jsonParse(doc.savesJson),
    comments: jsonParse(doc.commentsJson),
    isPrivate: doc.isPrivate ?? false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt || doc.createdAt,
  };
}

function pinToDoc(p: Pin): Record<string, any> {
  return {
    title: p.title,
    description: p.description,
    imageUrl: p.imageUrl,
    sourceUrl: p.sourceUrl || '',
    authorId: p.authorId,
    boardId: p.boardId || '',
    category: p.category,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    isPrivate: p.isPrivate,
    tagsJson: JSON.stringify(p.tags),
    likesJson: JSON.stringify(p.likes),
    savesJson: JSON.stringify(p.saves),
    commentsJson: JSON.stringify(p.comments),
  };
}

function docToBoard(doc: any): Board {
  return {
    id: doc.$id,
    name: doc.name,
    description: doc.description || '',
    coverImage: doc.coverImage || '',
    ownerId: doc.ownerId,
    pins: jsonParse(doc.pinIdsJson),
    followers: jsonParse(doc.followersJson),
    collaborators: jsonParse(doc.collaboratorsJson),
    isPrivate: doc.isPrivate ?? false,
    category: doc.category || 'All',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt || doc.createdAt,
  };
}

function boardToDoc(b: Board): Record<string, any> {
  return {
    name: b.name,
    description: b.description,
    coverImage: b.coverImage,
    ownerId: b.ownerId,
    category: b.category,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    isPrivate: b.isPrivate,
    pinIdsJson: JSON.stringify(b.pins),
    followersJson: JSON.stringify(b.followers),
    collaboratorsJson: JSON.stringify(b.collaborators),
  };
}

function docToNotification(doc: any): Notification {
  return {
    id: doc.$id,
    type: doc.type,
    fromUserId: doc.fromUserId,
    toUserId: doc.toUserId,
    pinId: doc.pinId || undefined,
    boardId: doc.boardId || undefined,
    message: doc.message,
    read: doc.read ?? false,
    createdAt: doc.createdAt,
  };
}

function notifToDoc(n: Notification): Record<string, any> {
  return {
    type: n.type,
    fromUserId: n.fromUserId,
    toUserId: n.toUserId,
    pinId: n.pinId || '',
    boardId: n.boardId || '',
    message: n.message,
    read: n.read,
    createdAt: n.createdAt,
  };
}

function jsonParse(val: string | undefined | null): any[] {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
}

// ── Helpers ──

export function stripPassword(u: ServerUser): SafeUser {
  const { passwordHash, ...safe } = u;
  return safe;
}

async function listAll(collectionId: string, queries: string[] = []): Promise<any[]> {
  const allDocs: any[] = [];
  let offset = 0;
  const limit = 100;
  while (true) {
    const { documents } = await databases.listDocuments(DB_ID, collectionId, [
      ...queries,
      Query.limit(limit),
      Query.offset(offset),
    ]);
    allDocs.push(...documents);
    if (documents.length < limit) break;
    offset += limit;
  }
  return allDocs;
}

// ==================== USERS ====================

export async function getAllUsers(): Promise<SafeUser[]> {
  const docs = await listAll(USERS_COL);
  return docs.map(d => stripPassword(docToUser(d)));
}

export async function getUserById(id: string): Promise<SafeUser | null> {
  try {
    const doc = await databases.getDocument(DB_ID, USERS_COL, id);
    return stripPassword(docToUser(doc));
  } catch { return null; }
}

export async function getUserFull(id: string): Promise<ServerUser | null> {
  try {
    const doc = await databases.getDocument(DB_ID, USERS_COL, id);
    return docToUser(doc);
  } catch { return null; }
}

export async function getUserByUsername(username: string): Promise<ServerUser | null> {
  const { documents } = await databases.listDocuments(DB_ID, USERS_COL, [
    Query.equal('username', username),
    Query.limit(1),
  ]);
  return documents.length ? docToUser(documents[0]) : null;
}

export async function getUserByEmail(email: string): Promise<ServerUser | null> {
  const { documents } = await databases.listDocuments(DB_ID, USERS_COL, [
    Query.equal('email', email),
    Query.limit(1),
  ]);
  return documents.length ? docToUser(documents[0]) : null;
}

export async function createUser(user: ServerUser): Promise<SafeUser> {
  const docId = user.id || ID.unique();
  const doc = await databases.createDocument(DB_ID, USERS_COL, docId, userToDoc(user));
  return stripPassword(docToUser(doc));
}

export async function updateUser(id: string, updates: Partial<Omit<ServerUser, 'id'>>): Promise<SafeUser | null> {
  try {
    const current = await getUserFull(id);
    if (!current) return null;

    const merged = { ...current, ...updates } as ServerUser;
    if (updates.settings) {
      merged.settings = { ...current.settings, ...updates.settings };
    }

    const doc = await databases.updateDocument(DB_ID, USERS_COL, id, userToDoc(merged));
    return stripPassword(docToUser(doc));
  } catch { return null; }
}

export async function toggleFollow(followerId: string, targetId: string): Promise<boolean> {
  if (followerId === targetId) return false;

  const followerDoc = await databases.getDocument(DB_ID, USERS_COL, followerId);
  const targetDoc = await databases.getDocument(DB_ID, USERS_COL, targetId);
  const follower = docToUser(followerDoc);
  const target = docToUser(targetDoc);

  const isFollowing = follower.following.includes(targetId);
  if (isFollowing) {
    follower.following = follower.following.filter(id => id !== targetId);
    target.followers = target.followers.filter(id => id !== followerId);
  } else {
    follower.following.push(targetId);
    target.followers.push(followerId);
    await databases.createDocument(DB_ID, NOTIFICATIONS_COL, ID.unique(), notifToDoc({
      id: '',
      type: 'follow',
      fromUserId: followerId,
      toUserId: targetId,
      message: `${follower.displayName} started following you`,
      read: false,
      createdAt: new Date().toISOString(),
    }));
  }

  await databases.updateDocument(DB_ID, USERS_COL, followerId, {
    followingJson: JSON.stringify(follower.following),
  });
  await databases.updateDocument(DB_ID, USERS_COL, targetId, {
    followersJson: JSON.stringify(target.followers),
  });

  return !isFollowing;
}

// ==================== PINS ====================

export async function getAllPins(): Promise<Pin[]> {
  const docs = await listAll(PINS_COL, [Query.orderDesc('createdAt')]);
  return docs.map(docToPin);
}

export async function getPinsPaginated(page: number = 1, limit: number = 20, category?: string): Promise<PaginatedResult<Pin>> {
  const queries: string[] = [Query.orderDesc('createdAt')];
  if (category && category !== 'All') {
    queries.push(Query.equal('category', category));
  }
  // Get total count
  const { total } = await databases.listDocuments(DB_ID, PINS_COL, [
    ...queries.filter(q => !q.includes('orderDesc')),
    Query.limit(1),
  ]);
  const offset = (page - 1) * limit;
  const { documents } = await databases.listDocuments(DB_ID, PINS_COL, [
    ...queries,
    Query.limit(limit),
    Query.offset(offset),
  ]);
  const data = documents.map(docToPin);
  return { data, total, page, limit, hasMore: offset + data.length < total };
}

export async function getPin(id: string): Promise<Pin | null> {
  try {
    const doc = await databases.getDocument(DB_ID, PINS_COL, id);
    return docToPin(doc);
  } catch { return null; }
}

export async function createPin(pin: Pin): Promise<Pin> {
  const docId = pin.id || ID.unique();
  const doc = await databases.createDocument(DB_ID, PINS_COL, docId, pinToDoc(pin));
  const created = docToPin(doc);

  if (pin.boardId) {
    try {
      const boardDoc = await databases.getDocument(DB_ID, BOARDS_COL, pin.boardId);
      const board = docToBoard(boardDoc);
      if (!board.pins.includes(created.id)) {
        board.pins.push(created.id);
        await databases.updateDocument(DB_ID, BOARDS_COL, pin.boardId, {
          pinIdsJson: JSON.stringify(board.pins),
        });
      }
    } catch { /* board not found */ }
  }

  return created;
}

export async function deletePin(id: string): Promise<boolean> {
  try {
    await databases.deleteDocument(DB_ID, PINS_COL, id);

    const boardDocs = await listAll(BOARDS_COL);
    for (const bdoc of boardDocs) {
      const board = docToBoard(bdoc);
      if (board.pins.includes(id)) {
        board.pins = board.pins.filter(pid => pid !== id);
        await databases.updateDocument(DB_ID, BOARDS_COL, board.id, {
          pinIdsJson: JSON.stringify(board.pins),
        });
      }
    }

    const notifDocs = await listAll(NOTIFICATIONS_COL, [Query.equal('pinId', id)]);
    for (const ndoc of notifDocs) {
      await databases.deleteDocument(DB_ID, NOTIFICATIONS_COL, ndoc.$id);
    }

    return true;
  } catch { return false; }
}

export async function toggleLikePin(pinId: string, userId: string): Promise<boolean> {
  const doc = await databases.getDocument(DB_ID, PINS_COL, pinId);
  const pin = docToPin(doc);

  const isLiked = pin.likes.includes(userId);
  if (isLiked) {
    pin.likes = pin.likes.filter(id => id !== userId);
  } else {
    pin.likes.push(userId);
    if (pin.authorId !== userId) {
      let displayName = 'Someone';
      try {
        const u = await databases.getDocument(DB_ID, USERS_COL, userId);
        displayName = u.displayName;
      } catch {}
      await databases.createDocument(DB_ID, NOTIFICATIONS_COL, ID.unique(), notifToDoc({
        id: '',
        type: 'like',
        fromUserId: userId,
        toUserId: pin.authorId,
        pinId,
        message: `${displayName} liked your pin "${pin.title}"`,
        read: false,
        createdAt: new Date().toISOString(),
      }));
    }
  }

  await databases.updateDocument(DB_ID, PINS_COL, pinId, {
    likesJson: JSON.stringify(pin.likes),
  });
  return !isLiked;
}

export async function toggleSavePin(pinId: string, userId: string): Promise<boolean> {
  const doc = await databases.getDocument(DB_ID, PINS_COL, pinId);
  const pin = docToPin(doc);

  const isSaved = pin.saves.includes(userId);
  if (isSaved) {
    pin.saves = pin.saves.filter(id => id !== userId);
  } else {
    pin.saves.push(userId);
    if (pin.authorId !== userId) {
      let displayName = 'Someone';
      try {
        const u = await databases.getDocument(DB_ID, USERS_COL, userId);
        displayName = u.displayName;
      } catch {}
      await databases.createDocument(DB_ID, NOTIFICATIONS_COL, ID.unique(), notifToDoc({
        id: '',
        type: 'save',
        fromUserId: userId,
        toUserId: pin.authorId,
        pinId,
        message: `${displayName} saved your pin "${pin.title}"`,
        read: false,
        createdAt: new Date().toISOString(),
      }));
    }
  }

  await databases.updateDocument(DB_ID, PINS_COL, pinId, {
    savesJson: JSON.stringify(pin.saves),
  });
  return !isSaved;
}

export async function savePinToBoard(pinId: string, boardId: string): Promise<boolean> {
  try {
    const boardDoc = await databases.getDocument(DB_ID, BOARDS_COL, boardId);
    const board = docToBoard(boardDoc);

    if (!board.pins.includes(pinId)) {
      board.pins.push(pinId);
      await databases.updateDocument(DB_ID, BOARDS_COL, boardId, {
        pinIdsJson: JSON.stringify(board.pins),
      });
    }

    await databases.updateDocument(DB_ID, PINS_COL, pinId, { boardId });
    return true;
  } catch { return false; }
}

export async function addComment(pinId: string, userId: string, text: string): Promise<Comment | null> {
  try {
    const doc = await databases.getDocument(DB_ID, PINS_COL, pinId);
    const pin = docToPin(doc);

    const comment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text,
      authorId: userId,
      pinId,
      likes: [],
      createdAt: new Date().toISOString(),
    };
    pin.comments.push(comment);

    await databases.updateDocument(DB_ID, PINS_COL, pinId, {
      commentsJson: JSON.stringify(pin.comments),
    });

    if (pin.authorId !== userId) {
      let displayName = 'Someone';
      try {
        const u = await databases.getDocument(DB_ID, USERS_COL, userId);
        displayName = u.displayName;
      } catch {}
      await databases.createDocument(DB_ID, NOTIFICATIONS_COL, ID.unique(), notifToDoc({
        id: '',
        type: 'comment',
        fromUserId: userId,
        toUserId: pin.authorId,
        pinId,
        message: `${displayName} commented on your pin "${pin.title}"`,
        read: false,
        createdAt: new Date().toISOString(),
      }));
    }

    return comment;
  } catch { return null; }
}

export async function deleteComment(pinId: string, commentId: string, userId: string): Promise<boolean> {
  try {
    const doc = await databases.getDocument(DB_ID, PINS_COL, pinId);
    const pin = docToPin(doc);
    const comment = pin.comments.find(c => c.id === commentId);
    if (!comment) return false;
    // Only comment author or pin author can delete
    if (comment.authorId !== userId && pin.authorId !== userId) return false;

    pin.comments = pin.comments.filter(c => c.id !== commentId);
    await databases.updateDocument(DB_ID, PINS_COL, pinId, {
      commentsJson: JSON.stringify(pin.comments),
    });
    return true;
  } catch { return false; }
}

export async function toggleLikeComment(pinId: string, commentId: string, userId: string): Promise<boolean> {
  const doc = await databases.getDocument(DB_ID, PINS_COL, pinId);
  const pin = docToPin(doc);
  const comment = pin.comments.find(c => c.id === commentId);
  if (!comment) return false;

  const isLiked = comment.likes.includes(userId);
  if (isLiked) {
    comment.likes = comment.likes.filter(id => id !== userId);
  } else {
    comment.likes.push(userId);
  }

  await databases.updateDocument(DB_ID, PINS_COL, pinId, {
    commentsJson: JSON.stringify(pin.comments),
  });
  return !isLiked;
}

export async function searchPins(query: string, category?: string): Promise<Pin[]> {
  const docs = await listAll(PINS_COL);
  const q = query.toLowerCase();
  return docs.map(docToPin).filter(p => {
    if (p.isPrivate) return false;
    if (category && category !== 'All' && p.category !== category) return false;
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q)
    );
  });
}

export async function getPinsByUser(userId: string): Promise<Pin[]> {
  const docs = await listAll(PINS_COL, [Query.equal('authorId', userId)]);
  return docs.map(docToPin);
}

export async function getSavedPinsByUser(userId: string): Promise<Pin[]> {
  const docs = await listAll(PINS_COL);
  return docs.map(docToPin).filter(p => p.saves.includes(userId));
}

export async function getTrendingPins(): Promise<Pin[]> {
  const docs = await listAll(PINS_COL);
  return docs
    .map(docToPin)
    .filter(p => !p.isPrivate)
    .sort(
      (a, b) =>
        b.likes.length + b.saves.length + b.comments.length -
        (a.likes.length + a.saves.length + a.comments.length)
    );
}

// ==================== BOARDS ====================

export async function getAllBoards(): Promise<Board[]> {
  const docs = await listAll(BOARDS_COL);
  return docs.map(docToBoard);
}

export async function getBoard(id: string): Promise<Board | null> {
  try {
    const doc = await databases.getDocument(DB_ID, BOARDS_COL, id);
    return docToBoard(doc);
  } catch { return null; }
}

export async function createBoard(board: Board): Promise<Board> {
  const docId = board.id || ID.unique();
  const doc = await databases.createDocument(DB_ID, BOARDS_COL, docId, boardToDoc(board));
  return docToBoard(doc);
}

export async function updateBoard(id: string, updates: Partial<Board>): Promise<Board | null> {
  try {
    const current = await getBoard(id);
    if (!current) return null;
    const merged = { ...current, ...updates, updatedAt: new Date().toISOString() };
    const doc = await databases.updateDocument(DB_ID, BOARDS_COL, id, boardToDoc(merged));
    return docToBoard(doc);
  } catch { return null; }
}

export async function deleteBoard(id: string): Promise<boolean> {
  try {
    const pinDocs = await listAll(PINS_COL, [Query.equal('boardId', id)]);
    for (const pdoc of pinDocs) {
      await databases.updateDocument(DB_ID, PINS_COL, pdoc.$id, { boardId: '' });
    }
    await databases.deleteDocument(DB_ID, BOARDS_COL, id);
    return true;
  } catch { return false; }
}

export async function getBoardsByUser(userId: string): Promise<Board[]> {
  const docs = await listAll(BOARDS_COL, [Query.equal('ownerId', userId)]);
  return docs.map(docToBoard);
}

export async function toggleFollowBoard(boardId: string, userId: string): Promise<boolean> {
  const doc = await databases.getDocument(DB_ID, BOARDS_COL, boardId);
  const board = docToBoard(doc);

  const isFollowing = board.followers.includes(userId);
  if (isFollowing) {
    board.followers = board.followers.filter(id => id !== userId);
  } else {
    board.followers.push(userId);
  }

  await databases.updateDocument(DB_ID, BOARDS_COL, boardId, {
    followersJson: JSON.stringify(board.followers),
  });
  return !isFollowing;
}

// ==================== NOTIFICATIONS ====================

export async function getNotifications(userId: string): Promise<Notification[]> {
  const docs = await listAll(NOTIFICATIONS_COL, [
    Query.equal('toUserId', userId),
    Query.orderDesc('createdAt'),
  ]);
  return docs.map(docToNotification);
}

export async function markNotificationRead(id: string): Promise<boolean> {
  try {
    await databases.updateDocument(DB_ID, NOTIFICATIONS_COL, id, { read: true });
    return true;
  } catch { return false; }
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const docs = await listAll(NOTIFICATIONS_COL, [
    Query.equal('toUserId', userId),
    Query.equal('read', false),
  ]);
  for (const doc of docs) {
    await databases.updateDocument(DB_ID, NOTIFICATIONS_COL, doc.$id, { read: true });
  }
}

// ==================== SEARCH ====================

export async function searchUsers(query: string): Promise<SafeUser[]> {
  const docs = await listAll(USERS_COL);
  const q = query.toLowerCase();
  return docs
    .map(docToUser)
    .filter(u =>
      u.username.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q)
    )
    .map(stripPassword);
}

export async function searchBoards(query: string): Promise<Board[]> {
  const docs = await listAll(BOARDS_COL);
  const q = query.toLowerCase();
  return docs
    .map(docToBoard)
    .filter(b =>
      !b.isPrivate &&
      (b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q))
    );
}

// ==================== SEED ====================

export async function isSeeded(): Promise<boolean> {
  const { total } = await databases.listDocuments(DB_ID, USERS_COL, [Query.limit(1)]);
  return total > 0;
}

export async function seedDatabase(data: {
  users: ServerUser[];
  pins: Pin[];
  boards: Board[];
  notifications: Notification[];
}): Promise<void> {
  for (const user of data.users) {
    try {
      await databases.createDocument(DB_ID, USERS_COL, user.id, userToDoc(user));
    } catch (e: any) {
      if (e.code !== 409) console.error('Seed user error:', e.message);
    }
  }

  for (const pin of data.pins) {
    try {
      await databases.createDocument(DB_ID, PINS_COL, pin.id, pinToDoc(pin));
    } catch (e: any) {
      if (e.code !== 409) console.error('Seed pin error:', e.message);
    }
  }

  for (const board of data.boards) {
    try {
      await databases.createDocument(DB_ID, BOARDS_COL, board.id, boardToDoc(board));
    } catch (e: any) {
      if (e.code !== 409) console.error('Seed board error:', e.message);
    }
  }

  for (const notif of data.notifications) {
    try {
      await databases.createDocument(DB_ID, NOTIFICATIONS_COL, notif.id, notifToDoc(notif));
    } catch (e: any) {
      if (e.code !== 409) console.error('Seed notif error:', e.message);
    }
  }
}
