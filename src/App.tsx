import { useEffect, useMemo, useState } from "react";
import {
  Album, BarChart3, Compass, Heart, Library, ListMusic, Menu,
  MoreHorizontal, Pause, Play, Plus, Search, SkipBack, SkipForward,
  Volume2, X, ChevronLeft
} from "lucide-react";

type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  duration: string;
  genre: string;
};

const tracks: Track[] = [
  { id: "afterglow", title: "Afterglow", artist: "Nia Sol", album: "Night Drive", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=700&q=80", duration: "3:42", genre: "Alternative" },
  { id: "velvet-sky", title: "Velvet Sky", artist: "Milo Grey", album: "Stillness", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=700&q=80", duration: "4:08", genre: "R&B" },
  { id: "slow-motion", title: "Slow Motion", artist: "Lena Vale", album: "Tidal", cover: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=700&q=80", duration: "3:51", genre: "Indie" },
  { id: "open-water", title: "Open Water", artist: "Kairo", album: "Drift", cover: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=700&q=80", duration: "4:16", genre: "Electronic" },
];

const genres = ["Alternative", "Afrobeats", "R&B", "Electronic", "Hip-Hop", "Indie", "Jazz"];

const routes = [
  ["Discover", Compass], ["Search", Search], ["Your Library", Library],
  ["Playlists", ListMusic], ["Charts", BarChart3],
] as const;

function useRoute() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, "", to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return { path, navigate };
}

function App() {
  const { path, navigate } = useRoute();
  const [playing, setPlaying] = useState(true);
  const [current, setCurrent] = useState(tracks[0]);
  const [query, setQuery] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [liked, setLiked] = useState<string[]>([]);

  const active = path === "/" ? "Discover"
    : path.startsWith("/search") ? "Search"
    : path.startsWith("/library") ? "Your Library"
    : path.startsWith("/playlists") ? "Playlists"
    : path.startsWith("/charts") ? "Charts" : "Discover";

  const filtered = useMemo(
    () => tracks.filter(t => [t.title, t.artist, t.album, t.genre].join(" ").toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const play = (track: Track) => {
    setCurrent(track);
    setPlaying(true);
  };

  const go = (label: string) => {
    setMobileNav(false);
    navigate(label === "Discover" ? "/" : `/${label.toLowerCase().replaceAll(" ", "-")}`);
  };

  const toggleLike = (id: string) =>
    setLiked(value => value.includes(id) ? value.filter(x => x !== id) : [...value, id]);

  return (
    <div className="app">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />

      <aside className="sidebar">
        <button className="brand" onClick={() => go("Discover")}><span className="brand-mark">V</span><span>Vibra</span></button>
        <nav>
          {routes.map(([label, Icon]) => (
            <button key={label} className={active === label ? "nav-item active" : "nav-item"} onClick={() => go(label)}>
              <Icon size={19} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <p>YOUR MUSIC</p>
          <button className="nav-item" onClick={() => go("Your Library")}><Heart size={19}/><span>Liked Songs</span></button>
          <button className="nav-item" onClick={() => go("Playlists")}><Plus size={19}/><span>New playlist</span></button>
        </div>
      </aside>

      <main>
        <header>
          <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)}><Menu size={21}/></button>
          <div className="search">
            <Search size={18}/>
            <input value={query} onChange={e => { setQuery(e.target.value); if (path !== "/search") navigate("/search"); }} placeholder="Search songs, artists, albums..." />
            {query && <button onClick={() => setQuery("")}><X size={16}/></button>}
          </div>
          <button className="profile">SN</button>
        </header>

        {mobileNav && <div className="mobile-panel">
          {routes.map(([label]) => <button key={label} onClick={() => go(label)}>{label}</button>)}
        </div>}

        {path === "/" ? (
          <>
            <section className="hero">
              <div className="hero-copy">
                <span className="eyebrow">A new way to listen</span>
                <h1>Music that<br/><em>moves</em> with you.</h1>
                <p>Discover records worth staying for. Built around the music, not the noise.</p>
                <div className="hero-actions">
                  <button className="primary" onClick={() => play(tracks[0])}><Play size={17} fill="currentColor"/> Play something</button>
                  <button className="secondary" onClick={() => navigate("/search")}>Explore</button>
                </div>
              </div>
              <div className="hero-art">
                <img src={current.cover} alt="" />
                <div className="art-caption"><span>NOW PLAYING</span><strong>{current.title}</strong><small>{current.artist}</small></div>
              </div>
            </section>

            <section className="section">
              <div className="section-head"><div><span className="eyebrow">Curated for you</span><h2>Keep listening</h2></div><button className="text-button" onClick={() => navigate("/library")}>See all</button></div>
              <div className="album-grid">
                {tracks.map(track => <article className="album-card" key={track.id} onClick={() => play(track)}>
                  <div className="cover"><img src={track.cover} alt="" /><button className="cover-play"><Play size={18} fill="currentColor"/></button></div>
                  <strong>{track.title}</strong><span>{track.artist} · {track.album}</span>
                </article>)}
              </div>
            </section>

            <section className="section split">
              <div>
                <div className="section-head"><div><span className="eyebrow">Right now</span><h2>Trending</h2></div></div>
                <TrackList tracks={tracks} current={current} play={play} liked={liked} toggleLike={toggleLike}/>
              </div>
              <div className="genres"><div className="section-head"><div><span className="eyebrow">Find your sound</span><h2>Browse genres</h2></div></div><div className="genre-list">{genres.map(g => <button key={g} onClick={() => { setQuery(g); navigate("/search"); }}>{g}<span>↗</span></button>)}</div></div>
            </section>
          </>
        ) : path.startsWith("/search") ? (
          <Page title="Search" eyebrow="Find something to play">
            <div className="search-page">
              <h1>{query ? `Results for “${query}”` : "What do you want to hear?"}</h1>
              <p>{query ? `${filtered.length} result${filtered.length === 1 ? "" : "s"} in your library` : "Search across songs, artists and albums."}</p>
              {query && <div className="album-grid">{filtered.map(track => <article className="album-card" key={track.id} onClick={() => play(track)}><div className="cover"><img src={track.cover} alt=""/><button className="cover-play"><Play size={18} fill="currentColor"/></button></div><strong>{track.title}</strong><span>{track.artist} · {track.album}</span></article>)}</div>}
            </div>
          </Page>
        ) : path.startsWith("/library") ? (
          <Page title="Your Library" eyebrow="Your music">
            <div className="library-summary"><strong>{liked.length}</strong><span>liked songs</span></div>
            <TrackList tracks={tracks.filter(t => liked.includes(t.id))} current={current} play={play} liked={liked} toggleLike={toggleLike} empty="Songs you like will appear here."/>
          </Page>
        ) : path.startsWith("/playlists") ? (
          <Page title="Playlists" eyebrow="Organize your listening">
            <div className="empty-state"><ListMusic size={30}/><h2>Your playlists</h2><p>Create a playlist when you find something worth keeping together.</p><button className="primary"><Plus size={16}/> New playlist</button></div>
          </Page>
        ) : (
          <Page title="Charts" eyebrow="Right now">
            <TrackList tracks={tracks} current={current} play={play} liked={liked} toggleLike={toggleLike}/>
          </Page>
        )}
      </main>

      <div className="player">
        <div className="player-track"><img src={current.cover} alt="" /><div><strong>{current.title}</strong><small>{current.artist}</small></div><button onClick={() => toggleLike(current.id)}><Heart size={17} fill={liked.includes(current.id) ? "currentColor" : "none"}/></button></div>
        <div className="controls"><div className="control-buttons"><button><SkipBack size={18}/></button><button className="play" onClick={() => setPlaying(!playing)}>{playing ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}</button><button><SkipForward size={18}/></button></div><div className="progress"><span style={{width: playing ? "42%" : "18%"}} /></div></div>
        <div className="volume"><span>2:14</span><span>{current.duration}</span><Volume2 size={18}/><div className="volume-line"/></div>
      </div>
    </div>
  );
}

function Page({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return <section className="page"><button className="back" onClick={() => window.history.back()}><ChevronLeft size={16}/> Back</button><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{children}</section>;
}

function TrackList({ tracks, current, play, liked, toggleLike, empty = "Nothing here yet." }: { tracks: Track[]; current: Track; play: (track: Track) => void; liked: string[]; toggleLike: (id: string) => void; empty?: string }) {
  if (!tracks.length) return <div className="empty-state"><Heart size={28}/><p>{empty}</p></div>;
  return <div className="track-list">{tracks.map((track, i) => <button className={current.id === track.id ? "track selected" : "track"} key={track.id} onClick={() => play(track)}>
    <span className="track-no">{String(i + 1).padStart(2,"0")}</span><img src={track.cover} alt="" />
    <span className="track-info"><strong>{track.title}</strong><small>{track.artist}</small></span><span className="track-album">{track.album}</span><span className="track-time">{track.duration}</span>
    <span onClick={e => { e.stopPropagation(); toggleLike(track.id); }}><Heart size={16} fill={liked.includes(track.id) ? "currentColor" : "none"}/></span><MoreHorizontal size={18}/>
  </button>)}</div>;
}

export default App;
