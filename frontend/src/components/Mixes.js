import axios from 'axios';
import { useState, useEffect } from 'react';

function Mixes() {
  const [mixes, setMixes] = useState([]);

  useEffect(() => {
    const fetchMixes = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/mixes', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setMixes(response.data);
      } catch (error) {
        alert('Error: ' + error.response?.data?.detail || 'Unknown error');
      }
    };
    fetchMixes();
  }, []);

  return (
    <div className="container mt-4">
      <h2>My Mixes</h2>
      {mixes.map((mix) => (
        <div key={mix.id} className="card mb-2">
          <div className="card-body">
            <h5>{mix.title}</h5>
            <p>Songs: {JSON.stringify(mix.detected_songs)}</p>
            <a href={mix.file_path} className="btn btn-primary">Play</a>
          </div>
        </div>
      ))}
    </div>
  );
}
export default Mixes;