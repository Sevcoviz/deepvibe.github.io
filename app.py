from flask import Flask, render_template, request, jsonify
import os
import zipfile
import json
import pandas as pd
import torch
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from werkzeug.utils import secure_filename
import tempfile
import shutil

# Import your model
from models.deepvibeV2 import HybridDeepVibeVAE

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max file size
app.config['UPLOAD_FOLDER'] = tempfile.gettempdir()

# Model configuration
MODEL_PATH = r"C:\Users\sevco\Documents\spotify_analysis\Spotify-Streaming-History-Analysis\analysis\UI_DeepVibe\models\hybrid_deepvibe_best.pth"
FULL_DB_PATH = r"C:\Users\sevco\Documents\spotify_analysis\Spotify-Streaming-History-Analysis\analysis\UI_DeepVibe\data\track_features_29.csv"

# Load model once at startup
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = None
track_uris = None
track_features_matrix = None
checkpoint = None


def calculate_user_stats(all_data):
    """Generates stats for All Time and individual years found in data"""
    import pandas as pd
    
    df = pd.DataFrame(all_data)
    
    # Standardize column names based on Spotify's different formats
    artist_key = 'master_metadata_album_artist_name' if 'master_metadata_album_artist_name' in df.columns else 'artistName'
    track_key = 'master_metadata_track_name' if 'master_metadata_track_name' in df.columns else 'trackName'
    ms_key = 'ms_played' if 'ms_played' in df.columns else 'msPlayed'
    ts_key = 'ts' if 'ts' in df.columns else 'endTime'

    # Convert timestamp to datetime and extract year
    if ts_key in df.columns:
        df['year'] = pd.to_datetime(df[ts_key]).dt.year.astype(str)
    else:
        df['year'] = "Unknown"

    def get_summary(data_subset):
        if data_subset.empty:
            return None
        return {
            'total_streams': len(data_subset),
            'unique_artists': int(data_subset[artist_key].nunique()) if artist_key in data_subset.columns else 0,
            'top_artist': data_subset[artist_key].mode()[0] if artist_key in data_subset.columns and not data_subset[artist_key].empty else "Unknown",
            'top_track': data_subset[track_key].mode()[0] if track_key in data_subset.columns and not data_subset[track_key].empty else "Unknown",
            'total_hours': round(data_subset[ms_key].sum() / (1000 * 60 * 60), 1) if ms_key in data_subset.columns else 0
        }

    # Final result dictionary
    profiles = {}
    
    # 1. Calculate All Time
    profiles['All Time'] = get_summary(df)
    
    # 2. Calculate for each year (Sorted descending)
    available_years = sorted(df['year'].unique(), reverse=True)
    for yr in available_years:
        if yr != "nan" and yr != "Unknown":
            profiles[yr] = get_summary(df[df['year'] == yr])

    return profiles

def load_model():
    global model, track_uris, track_features_matrix, checkpoint
    print("Loading model...")
    checkpoint = torch.load(MODEL_PATH, map_location=device, weights_only=False)
    track_uris = np.array(checkpoint['track_cols'])
    track_features_matrix = torch.from_numpy(checkpoint['audio_features']).to(device)
    
    model = HybridDeepVibeVAE(interaction_dim=10000, audio_dim=12).to(device)
    model.load_state_dict(checkpoint['model_state'])
    model.eval()
    print("Model loaded successfully!")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.endswith('.zip'):
            return jsonify({'error': 'Please upload a .zip file'}), 400
        
        # Get mode from form data
        mode = request.form.get('mode', 'standard')
        hidden_gems = (mode == 'hidden')
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        temp_dir = tempfile.mkdtemp()
        zip_path = os.path.join(temp_dir, filename)
        file.save(zip_path)
        
        # Extract and process
        extract_dir = os.path.join(temp_dir, 'extracted')
        os.makedirs(extract_dir, exist_ok=True)
        
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        
        # Find streaming history files
        streaming_files = []
        for root, dirs, files in os.walk(extract_dir):
            for file in files:
                if 'Streaming_History' in file or 'endsong' in file.lower():
                    streaming_files.append(os.path.join(root, file))
        
        if not streaming_files:
            shutil.rmtree(temp_dir)
            return jsonify({'error': 'No streaming history files found in the archive'}), 400
        
        # Process streaming history
        all_data = []
        for file_path in streaming_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    all_data.extend(data)
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
        
        if not all_data:
            shutil.rmtree(temp_dir)
            return jsonify({'error': 'Could not parse streaming history'}), 400
        
        user_stats = calculate_user_stats(all_data)
        
        # Convert to user interaction vector
        user_vector = create_user_vector(all_data)
        
        # Generate recommendations with selected mode
        recommendations = generate_recommendations(user_vector, hidden_gems=hidden_gems, top_n=10)
        
        # Cleanup
        shutil.rmtree(temp_dir)
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'total_streams': len(all_data),
            'stats': user_stats,
            'mode': mode
        })
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

def create_user_vector(streaming_data):
    """Convert streaming history to interaction vector"""
    global track_uris
    
    # Count plays per track URI
    track_counts = {}
    for entry in streaming_data:
        uri = entry.get('spotify_track_uri') or entry.get('track_uri')
        if uri:
            track_counts[uri] = track_counts.get(uri, 0) + 1
    
    # Create vector matching model's track order
    user_vec = np.zeros(len(track_uris), dtype=np.float32)
    for i, uri in enumerate(track_uris):
        if uri in track_counts:
            user_vec[i] = track_counts[uri]
    
    # Normalize
    if user_vec.sum() > 0:
        user_vec = user_vec / user_vec.sum()
    
    return user_vec

def generate_recommendations(user_vec, hidden_gems=False, top_n=10):
    """
    Generate recommendations based on user vector
    
    Args:
        user_vec: User interaction vector
        hidden_gems: If True, applies popularity penalty to surface underground tracks
        top_n: Number of recommendations to return
    """
    global model, track_features_matrix, checkpoint
    
    feature_names = [
        'acousticness', 'danceability', 'energy', 'instrumentalness', 
        'liveness', 'loudness', 'speechiness', 'tempo', 'valence', 
        'artist_popularity', 'track_popularity', 'explicit'
    ]
    
    # Convert to tensor
    user_tensor = torch.from_numpy(user_vec).unsqueeze(0).to(device)
    
    # Generate ideal DNA
    with torch.no_grad():
        user_audio = (user_tensor @ track_features_matrix) / (user_tensor.sum() + 1e-8)
        recon, _, _ = model(user_tensor, user_audio)
        
        # Sharpening
        temp_recon = recon / 0.05
        top_v, top_i = torch.topk(temp_recon, 50)
        mask = torch.full_like(temp_recon, float('-inf'))
        mask.scatter_(1, top_i, top_v)
        
        weights = torch.softmax(mask, dim=1)
        ideal_dna = (weights @ track_features_matrix).cpu().numpy().flatten()
    
    # Load full database
    full_db = pd.read_csv(FULL_DB_PATH).dropna(subset=feature_names).drop_duplicates('spotify_track_uri')
    
    # Apply hidden gems filter if enabled
    if hidden_gems:
        full_db = full_db[full_db['track_popularity'] < 50].copy()
    
    # Calculate similarities
    db_matrix = full_db[feature_names].values
    scaler = MinMaxScaler()
    db_matrix_scaled = scaler.fit_transform(db_matrix)
    
    similarities = cosine_similarity([ideal_dna], db_matrix_scaled).flatten()
    full_db['similarity'] = similarities
    
    # Scoring based on mode
    if hidden_gems:
        # Penalize popularity to surface underground tracks
        pop_penalty = (full_db['track_popularity'] / 100.0) * 0.2
        full_db['vibe_score'] = full_db['similarity'] - pop_penalty
    else:
        # Standard mode: pure similarity
        full_db['vibe_score'] = full_db['similarity']
    
    # Filter out history
    history_uris = set(track_uris[user_vec > 0.01])
    recommendations = full_db[~full_db['spotify_track_uri'].isin(history_uris)]
    top_recs = recommendations.sort_values('vibe_score', ascending=False).head(top_n)
    
    # Format results
    results = []
    for _, row in top_recs.iterrows():
        track_id = row['spotify_track_uri'].split(':')[-1]
        results.append({
            'track_name': row['track_name'],
            'artist_name': row['artist_name'],
            'vibe_score': float(row['vibe_score']),
            'similarity': float(row['similarity']),
            'popularity': int(row['track_popularity']),
            'spotify_url': f"https://open.spotify.com/track/{track_id}"
        })
    
    return results

if __name__ == '__main__':
    load_model()
    app.run(debug=True, host='0.0.0.0', port=5000)