import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MovieCard from "./components/MovieCard.jsx";
import MovieDetails from "./components/MovieDetails.jsx";
import "./App.css";

import scaryVideo from "./assets/videos/medo2.mp4";
import classicVideo from "./assets/videos/classico.mp4";
import comedyVideo from "./assets/videos/medo3.mp4";

import flagPT from "./assets/flags/Portugal.png";
import flagEN from "./assets/flags/ingles1.png";

const API_KEY = "a342963cc1242a9fd28f7bf540ea388f";
const BASE_URL = "https://api.themoviedb.org/3";

const categories = [
  { label: { pt: "Mais Assustador", en: "Most Terrifying" }, genre: 27, video: scaryVideo },
  { label: { pt: "Clássico", en: "Classic" }, genre: 18, video: classicVideo },
  { label: { pt: "Comédia de Terror", en: "Horror Comedy" }, genre: "27,35", video: comedyVideo }
];

const texts = {
  pt: {
    title: "Sugestões de filmes",
    loading: "Carregando filmes...",
    noMovies: "Nenhum filme encontrado 😔",
    recommendButton: "👻 Recomenda-me um filme aleatório!",
    ifYouLiked: "Se gostaste de",
    similarMovies: "🎬 Ver filmes similares",
    searchName: "Pesquisar por nome...",
    rating: "Nota mínima",
    year: "Ano",
  },
  en: {
    title: "Movie Suggestions",
    loading: "Loading movies...",
    noMovies: "No movies found 😔",
    recommendButton: "👻 Recommend me a random movie!",
    ifYouLiked: "If you liked",
    similarMovies: "🎬 View similar movies",
    searchName: "Search by name...",
    rating: "Minimum rating",
    year: "Year",
  }
};

function App() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("pt");

  const [searchName, setSearchName] = useState("");
  const [searchRating, setSearchRating] = useState("");
  const [searchYear, setSearchYear] = useState("");
  const [baseMovie, setBaseMovie] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${selectedCategory.genre}&sort_by=popularity.desc&language=${language === "pt" ? "pt-PT" : "en-US"}`
        );
        const data = await res.json();
        setMovies(data.results.slice(0, 20));
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
      setBaseMovie(null);
    };

    fetchMovies();
  }, [selectedCategory, language]);

  const filteredMovies = movies.filter((movie) => {
    const matchesName = movie.title.toLowerCase().includes(searchName.toLowerCase());
    const matchesRating = searchRating ? movie.vote_average >= parseFloat(searchRating) : true;
    const matchesYear = searchYear ? movie.release_date.startsWith(searchYear) : true;
    return matchesName && matchesRating && matchesYear;
  });

  const recommendRandomMovie = () => {
    if (filteredMovies.length > 0) {
      const randomMovie = filteredMovies[Math.floor(Math.random() * filteredMovies.length)];
      setBaseMovie(randomMovie);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const fetchSimilarMovies = async (movieId) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}&language=${language === "pt" ? "pt-PT" : "en-US"}`
      );
      const data = await res.json();
      setMovies(data.results.slice(0, 12));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="app">
              <video autoPlay loop muted className="background-video" key={selectedCategory.label[language]}>
                <source src={selectedCategory.video} type="video/mp4" />
              </video>

              <div className="language-selector">
                <img src={flagPT} alt="PT" onClick={() => setLanguage("pt")} className={language === "pt" ? "active" : ""} />
                <img src={flagEN} alt="EN" onClick={() => setLanguage("en")} className={language === "en" ? "active" : ""} />
              </div>

              <h1>{texts[language].title}</h1>

              <div className="controls">
                <select
                  value={selectedCategory.label[language]}
                  onChange={(e) => {
                    const category = categories.find(cat => cat.label[language] === e.target.value);
                    setSelectedCategory(category);
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat.label.pt} value={cat.label[language]}>
                      {cat.label[language]}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder={texts[language].searchName}
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
                <input
                  type="number"
                  placeholder={texts[language].rating}
                  min="0"
                  max="10"
                  value={searchRating}
                  onChange={(e) => setSearchRating(e.target.value)}
                />
                <input
                  type="number"
                  placeholder={texts[language].year}
                  value={searchYear}
                  onChange={(e) => setSearchYear(e.target.value)}
                />

                <button onClick={recommendRandomMovie}>
                  {texts[language].recommendButton}
                </button>
              </div>

              {baseMovie && (
                <div className="movie-overview">
                  <h2>{texts[language].ifYouLiked} "{baseMovie.title}"...</h2>
                  <p>{baseMovie.overview || (language === "pt" ? "Sem resumo disponível." : "No summary available.")}</p>
                  <button onClick={() => fetchSimilarMovies(baseMovie.id)}>
                    {texts[language].similarMovies}
                  </button>
                </div>
              )}

              {loading ? (
                <p className="loading">{texts[language].loading}</p>
              ) : (
                <div className="movie-grid">
                  {filteredMovies.length > 0 ? (
                    filteredMovies.map((movie, i) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        onClick={() => setBaseMovie(movie)}
                        index={i} // <-- para animação de delay
                      />
                    ))
                  ) : (
                    <p>{texts[language].noMovies}</p>
                  )}
                </div>
              )}
            </div>
          }
        />
        <Route path="/movie/:id" element={<MovieDetails language={language} />} />
      </Routes>
    </Router>
  );
}

export default App;
