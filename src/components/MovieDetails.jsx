import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./MovieDetails.css";


const API_KEY = "a342963cc1242a9fd28f7bf540ea388f";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/original";

export default function MovieDetails({ language }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [cast, setCast] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=${language === "pt" ? "pt-PT" : "en-US"}`);
        const data = await res.json();
        setMovie(data);

        const trailerRes = await fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=${language === "pt" ? "pt-PT" : "en-US"}`);
        const trailerData = await trailerRes.json();
        const youtubeTrailer = trailerData.results.find(v => v.type === "Trailer" && v.site === "YouTube");
        setTrailer(youtubeTrailer ? youtubeTrailer.key : null);

        const castRes = await fetch(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}&language=${language === "pt" ? "pt-PT" : "en-US"}`);
        const castData = await castRes.json();
        setCast(castData.cast.slice(0, 6));
      } catch (err) {
        console.error(err);
      }
    };

    fetchDetails();
  }, [id, language]);

  if (!movie) return <p>Carregando...</p>;

  return (
    <div className="movie-details">
      <button onClick={() => navigate("/")}>⬅ Voltar</button>
      <h1>{movie.title}</h1>
      <img src={`${IMG_URL}${movie.poster_path}`} alt={movie.title} className="poster" />
      <p><strong>Resumo:</strong> {movie.overview || "Sem resumo disponível."}</p>
      {trailer && (
        <iframe
          width="80%"
          height="400"
          src={`https://www.youtube.com/embed/${trailer}`}
          title="Trailer"
          allowFullScreen
        ></iframe>
      )}
      <h3>Elenco principal:</h3>
      <div className="cast-grid">
        {cast.map(actor => (
          <div key={actor.id} className="actor">
            {actor.profile_path && <img src={`${IMG_URL}${actor.profile_path}`} alt={actor.name} />}
            <p>{actor.name}</p>
            <small>{actor.character}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
