import { useMemo, useState } from "react";
import {
  Album, BarChart3, Compass, Heart, Library, ListMusic, Menu,
  MoreHorizontal, Pause, Play, Plus, Search, SkipBack, SkipForward,
  Volume2, X
} from "lucide-react";

type Track = {
  title: string; artist: string; album: string; cover: string; duration: string;
};

const tracks: Track[] = [
  { title: "Afterglow", artist: "Nia Sol", album: "Night Drive", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=700&q=80", duration: "3:42" },
  { title: "Velvet Sky", artist: "Milo Grey", album: "Stillness", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=700&q=80", duration: "4:08" },
  { title: "Slow Motion", artist: "Lena Vale", album: "Tidal", cover: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=700&q=80", duration: "3:51" },
  { title: "Open Water", artist: "Kairo", album: "Drift", cover: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=700&q=80", duration: "4:16" },
];

const genres = ["Alternative", "Afrobeats", "R&B", "Electronic", "Hip-Hop", "Indie", "Jazz"];

function App() {
  const [active, setActive] = useState("Discover");
  const [playing, setPlaying] = useState(true);
  const [current, setCurrent] = useState(tracks[0]);
  const [query, setQuery] = useState("");
  const [mobileNav, setMobileNav] = useState(false);

  const filtered = useMemo(
    () => tracks.filter(t => [t.title, t.artist, t.album].join(" ").toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const play = (track: Track) => { setCurrent(track); setPlaying(true); };

  return (
    <div className="app">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />

      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">V</span><span>Vibra</span></div>
        <nav>
          {[
            [Compass, "Discover"], [Search, "Search"], [Library, "Your Library"],
            [ListMusic, "Playlists"], [BarChart3, "Charts"]
          ].map(([Icon, label]) => (
            <button key={label as string} className={active === label ? "nav-item active" : "nav-item"} onClick={() => setActive(label as string)}>
              <Icon size={19} /><span>{label as string}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <p>YOUR MUSIC</p>
          <button className="nav-item"><Heart size={19}/><span>Liked Songs</span></button>
          <button className="nav-item"><Plus size={19}/><span>New playlist</span></button>
        </div>
      </aside>

      <main>
        <header>
          <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)}><Menu size={21}/></button>
          <div className="search">
            <Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search songs, artists, albums..." />
            {query && <button onClick={() => setQuery("")}><X size={16}/></button>}
          </div>
          <button className="profile">SN</button>
        </header>

        {mobileNav && <div className="mobile-panel">
          {["Discover","Search","Your Library","Playlists","Charts"].map(x => <button key={x} onClick={() => {setActive(x);setMobileNav(false)}}>{x}</button>)}
        </div>}

        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">A new way to listen</span>
            <h1>Music that<br/><em>moves</em> with you.</h1>
            <p>Discover records worth staying for. Built around the music, not the noise.</p>
            <div className="hero-actions">
              <button className="primary" onClick={() => play(tracks[0])}><Play size={17} fill="currentColor"/> Play something</button>
              <button className="secondary">Explore</button>
            </div>
          </div>
          <div className="hero-art">
            <img src={current.cover} alt="" />
            <div className="art-caption"><span>NOW PLAYING</span><strong>{current.title}</strong><small>{current.artist}</small></div>
          </div>
        </section>

        <section className="section">
          <div className="section-head"><div><span className="eyebrow">Curated for you</span><h2>Keep listening</h2></div><button className="text-button">See all</button></div>
          <div className="album-grid">
            {filtered.map(track => <article className="album-card" key={track.title} onClick={() => play(track)}>
              <div className="cover"><img src={track.cover} alt="" /><button className="cover-play"><Play size={18} fill="currentColor"/></button></div>
              <strong>{track.title}</strong><span>{track.artist} · {track.album}</span>
            </article>)}
          </div>
        </section>

        <section className="section split">
          <div>
            <div className="section-head"><div><span className="eyebrow">Right now</span><h2>Trending</h2></div></div>
            <div className="track-list">
              {tracks.map((track, i) => <button className="track" key={track.title} onClick={() => play(track)}>
                <span className="track-no">{String(i+1).padStart(2,"0")}</span>
                <img src={track.cover} alt="" />
                <span className="track-info"><strong>{track.title}</strong><small>{track.artist}</small></span>
                <span className="track-album">{track.album}</span><span className="track-time">{track.duration}</span><MoreHorizontal size={18}/>
              </button>)}
            </div>
          </div>
          <div className="genres"><div className="section-head"><div><span className="eyebrow">Find your sound</span><h2>Browse genres</h2></div></div><div className="genre-list">{genres.map(g => <button key={g}>{g}<span>↗</span></button>)}</div></div>
        </section>
      </main>

      <div className="player">
        <div className="player-track"><img src={current.cover} alt="" /><div><strong>{current.title}</strong><small>{current.artist}</small></div><Heart size={17}/></div>
        <div className="controls"><div className="control-buttons"><button><SkipBack size={18}/></button><button className="play" onClick={() => setPlaying(!playing)}>{playing ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}</button><button><SkipForward size={18}/></button></div><div className="progress"><span style={{width: playing ? "42%" : "18%"}} /></div></div>
        <div className="volume"><span>2:14</span><span>4:08</span><Volume2 size={18}/><div className="volume-line"/></div>
      </div>
    </div>
  );
}

export default App;