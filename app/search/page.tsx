'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import PinCard from '@/components/pin-card';
import UserAvatar from '@/components/user-avatar';
import MasonryGrid from '@/components/masonry-grid';
import { Search, X, Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/app-context';
import { api } from '@/lib/api-client';
import { formatCount } from '@/lib/helpers';
import type { Pin, User, Board } from '@/lib/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { searchPins: localSearchPins, searchUsers: localSearchUsers, searchBoards: localSearchBoards } = useApp();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchType, setSearchType] = useState<'all' | 'pins' | 'boards' | 'users'>('all');
  const [loading, setLoading] = useState(false);
  const [pinResults, setPinResults] = useState<Pin[]>([]);
  const [userResults, setUserResults] = useState<User[]>([]);
  const [boardResults, setBoardResults] = useState<Board[]>([]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Search via API with fallback to local
  useEffect(() => {
    if (!searchQuery.trim()) {
      setPinResults([]);
      setUserResults([]);
      setBoardResults([]);
      return;
    }

    // Immediately show local results for instant feedback
    setPinResults(localSearchPins(searchQuery));
    setUserResults(localSearchUsers(searchQuery));
    setBoardResults(localSearchBoards(searchQuery));

    // Then fetch from server for accurate results
    setLoading(true);
    api.search(searchQuery)
      .then(({ pins, users, boards }) => {
        setPinResults(pins);
        setUserResults(users);
        setBoardResults(boards);
      })
      .catch(() => {
        // Keep local results on error
      })
      .finally(() => setLoading(false));
  }, [searchQuery, localSearchPins, localSearchUsers, localSearchBoards]);

  const totalResults = pinResults.length + userResults.length + boardResults.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <section className="w-full bg-gradient-to-b from-card/30 to-background py-12 border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-6">Search Auroric</h1>
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-foreground/40" />
            <input
              type="text"
              placeholder="Search pins, boards, or creators..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-card/50 border border-border/30 rounded-full pl-14 pr-12 py-3 text-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 smooth-transition"
            />
            {searchQuery && (
              <button type="button" onClick={() => { setSearchQuery(''); router.push('/search'); }}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-foreground/60 hover:text-foreground smooth-transition">
                <X className="w-5 h-5" />
              </button>
            )}
          </form>
        </div>
      </section>

      <main className="flex-1 w-full py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {searchQuery ? (
            <>
              <div className="flex items-center gap-2 mb-8 border-b border-border/30 pb-4 overflow-x-auto">
                {[
                  { value: 'all', label: `All (${totalResults})` },
                  { value: 'pins', label: `Pins (${pinResults.length})` },
                  { value: 'boards', label: `Boards (${boardResults.length})` },
                  { value: 'users', label: `Users (${userResults.length})` },
                ].map(filter => (
                  <button key={filter.value} onClick={() => setSearchType(filter.value as any)}
                    className={`px-4 py-2 font-semibold whitespace-nowrap smooth-transition border-b-2 ${searchType === filter.value ? 'border-accent text-accent' : 'border-transparent text-foreground/60 hover:text-foreground'}`}>
                    {filter.label}
                  </button>
                ))}
              </div>

              <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
                Results for <span className="text-accent">"{searchQuery}"</span>
                {loading && <Loader2 className="w-4 h-4 animate-spin text-accent" />}
              </h2>

              {/* Pins */}
              {(searchType === 'all' || searchType === 'pins') && pinResults.length > 0 && (
                <div className="mb-12">
                  {searchType === 'all' && <h3 className="text-lg font-bold mb-4">Pins</h3>}
                  <MasonryGrid columns={3}>
                    {pinResults.map(pin => (
                      <PinCard key={pin.id} id={pin.id} title={pin.title} imageUrl={pin.imageUrl} authorId={pin.authorId} likes={pin.likes} saves={pin.saves} comments={pin.comments} />
                    ))}
                  </MasonryGrid>
                </div>
              )}

              {/* Users */}
              {(searchType === 'all' || searchType === 'users') && userResults.length > 0 && (
                <div className="mb-12">
                  {searchType === 'all' && <h3 className="text-lg font-bold mb-4">Users</h3>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userResults.map(user => (
                      <Link key={user.id} href={`/user/${user.username}`} className="pin-card p-4 flex items-center gap-4 group hover:border-accent/50">
                        <UserAvatar userId={user.id} displayName={user.displayName} size="lg" />
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-accent smooth-transition">{user.displayName}</p>
                          <p className="text-sm text-foreground/60">@{user.username}</p>
                          <p className="text-xs text-foreground/50 mt-1">{formatCount(user.followers.length)} followers</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Boards */}
              {(searchType === 'all' || searchType === 'boards') && boardResults.length > 0 && (
                <div className="mb-12">
                  {searchType === 'all' && <h3 className="text-lg font-bold mb-4">Boards</h3>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {boardResults.map(board => (
                      <Link key={board.id} href={`/board/${board.id}`} className="pin-card p-4 group hover:border-accent/50">
                        <h4 className="font-semibold text-foreground group-hover:text-accent smooth-transition">{board.name}</h4>
                        <p className="text-sm text-foreground/60 line-clamp-2 mt-1">{board.description}</p>
                        <p className="text-xs text-foreground/50 mt-2">{board.pins.length} pins • {board.isPrivate ? '🔒 Private' : '🌐 Public'}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {totalResults === 0 && (
                <div className="text-center py-16">
                  <Search className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-foreground mb-2">No Results</h2>
                  <p className="text-lg text-foreground/60">No matches found for "{searchQuery}". Try different keywords.</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Start Searching</h2>
              <p className="text-lg text-foreground/60">Enter a search term to find pins, boards, and creators on Auroric</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
