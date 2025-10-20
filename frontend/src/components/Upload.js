import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Upload() {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }
    if (!title) {
      alert('Please enter a title');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No token found. Please log in.');
      navigate('/');
      return;
    }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    try {
      const response = await axios.post('http://127.0.0.1:8000/upload-mix', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload response:', response.data);
      alert('Mix uploaded: ' + JSON.stringify(response.data.detected_songs));
      navigate('/mixes');
    } catch (error) {
      console.error('Upload error:', error);
      const message = error.response?.data?.detail || error.message || 'Unknown error';
      alert(`Error: ${message} (Status: ${error.response?.status || 'N/A'})`);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4" style={{ width: '300px' }}>
        <h2 className="text-center">Upload Mix</h2>
        <input
          className="form-control mb-2"
          type="text"
          placeholder="Mix Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="form-control mb-2"
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button className="btn btn-primary" onClick={handleSubmit}>
          Upload
        </button>
      </div>
    </div>
  );
}
export default Upload;