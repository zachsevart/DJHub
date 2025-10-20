import axios from 'axios';
import { useState, useEffect } from 'react';

function Feed() {
  const [mixes, setMixes] = useState([]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/feed');
        setMixes(response.data);
      } catch (error) {
        alert('Error: ' + error.response?.data?.detail || 'Unknown error');
      }
    };
    fetchFeed();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Community Feed</h2>
      {mixes.map((mix) => (
        <div key={mix.id} className="card mb-2">
          <div className="card-body">
            <h5>{mix.title} by {mix.user_id}</h5>
            <p>Songs: {JSON.stringify(mix.detected_songs)}</p>
            <a href={mix.file_path} className="btn btn-primary">Play</a>
          </div>
        </div>
      ))}
    </div>
  );
}
export default Feed;