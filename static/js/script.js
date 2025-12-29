// // Initialize Lucide icons
// lucide.createIcons();

// function selectMode(mode) {
//     currentMode = mode;
    
//     const standardBtn = document.getElementById('standardMode');
//     const hiddenBtn = document.getElementById('hiddenGemsMode');
//     const description = document.getElementById('modeDescription');
    
//     if (mode === 'standard') {
//         standardBtn.classList.remove('inactive');
//         standardBtn.classList.add('active');
//         hiddenBtn.classList.remove('active');
//         hiddenBtn.classList.add('inactive');
        
//         description.innerHTML = '<p><strong class="text-emerald-400">Standard Mode:</strong> Finds highest correlation matches for your current vibe across all popularity levels.</p>';
//     } else {
//         hiddenBtn.classList.remove('inactive');
//         hiddenBtn.classList.add('active');
//         standardBtn.classList.remove('active');
//         standardBtn.classList.add('inactive');
        
//         description.innerHTML = '<p><strong class="text-emerald-400">Hidden Gems Mode:</strong> Surfaces underground tracks with high acoustic similarity while penalizing mainstream popularity.</p>';
//     }
    
//     // Re-render icons
//     lucide.createIcons();
// }

// // File input handling
// const fileInput = document.getElementById('fileInput');
// const resultsTable = document.getElementById('resultsTable');
// const modeIndicator = document.getElementById('resultsModeIndicator');

// fileInput.addEventListener('change', handleFileUpload);

// // Drag and drop functionality
// const uploadPanel = document.querySelector('.bento-panel');
// uploadPanel.addEventListener('dragover', (e) => {
//     e.preventDefault();
//     uploadPanel.classList.add('border-emerald-500');
// });

// uploadPanel.addEventListener('dragleave', () => {
//     uploadPanel.classList.remove('border-emerald-500');
// });

// uploadPanel.addEventListener('drop', (e) => {
//     e.preventDefault();
//     uploadPanel.classList.remove('border-emerald-500');
    
//     const files = e.dataTransfer.files;
//     if (files.length > 0) {
//         fileInput.files = files;
//         handleFileUpload({ target: fileInput });
//     }
// });

// async function handleFileUpload(event) {
//     const file = event.target.files[0];
    
//     if (!file) return;
    
//     if (!file.name.endsWith('.zip')) {
//         showError('Please upload a .zip file');
//         return;
//     }
    
//     // Show loading state
//     showLoading();
    
//     try {
//         const formData = new FormData();
//         formData.append('file', file);
        
//         const response = await fetch('/analyze', {
//             method: 'POST',
//             body: formData
//         });
        
//         const data = await response.json();
        
//         if (!response.ok) {
//             throw new Error(data.error || 'Upload failed');
//         }
        
//         displayResults(data);
        
//     } catch (error) {
//         showError(error.message);
//     }
// }

// function showLoading() {
//     resultsTable.innerHTML = `
//         <div class="flex flex-col items-center justify-center h-full">
//             <div class="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
//             <p class="text-neutral-400 text-sm mb-2">Analyzing your music DNA...</p>
//             <p class="text-neutral-600 text-xs">This may take a minute</p>
//         </div>
//     `;
// }

// function showError(message) {
//     resultsTable.innerHTML = `
//         <div class="flex flex-col items-center justify-center h-full text-red-400">
//             <i data-lucide="alert-circle" class="mb-4"></i>
//             <p class="text-sm font-semibold mb-2">Error</p>
//             <p class="text-xs text-neutral-500">${message}</p>
//         </div>
//     `;
//     lucide.createIcons();
// }

// function displayResults(data) {
//     const recommendations = data.recommendations;
//     const totalStreams = data.total_streams;
    
//     let html = `
//         <div class="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
//             <div class="flex items-center gap-2 text-emerald-400 mb-2">
//                 <i data-lucide="check-circle" size="18"></i>
//                 <span class="font-bold text-sm">Analysis Complete</span>
//             </div>
//             <p class="text-xs text-neutral-400">Processed ${totalStreams.toLocaleString()} streams • Generated ${recommendations.length} recommendations</p>
//         </div>
//         <div class="space-y-3">
//     `;
    
//     recommendations.forEach((rec, index) => {
//         const scoreColor = rec.vibe_score > 0.8 ? 'text-emerald-400' : 
//                           rec.vibe_score > 0.6 ? 'text-yellow-400' : 'text-neutral-400';
        
//         html += `
//             <div class="bg-neutral-900/50 rounded-xl p-4 border border-neutral-800 hover:border-emerald-500/50 transition group">
//                 <div class="flex items-start justify-between mb-2">
//                     <div class="flex-1">
//                         <div class="flex items-center gap-2 mb-1">
//                             <span class="text-xs font-mono text-neutral-600">#${index + 1}</span>
//                             <h3 class="font-bold text-white text-sm group-hover:text-emerald-400 transition">${rec.track_name}</h3>
//                         </div>
//                         <p class="text-xs text-neutral-500">${rec.artist_name}</p>
//                     </div>
//                     <div class="text-right">
//                         <div class="text-lg font-bold ${scoreColor}">${(rec.vibe_score * 100).toFixed(1)}</div>
//                         <div class="text-xs text-neutral-600">vibe score</div>
//                     </div>
//                 </div>
                
//                 <div class="flex items-center justify-between text-xs mt-3 pt-3 border-t border-neutral-800">
//                     <div class="flex gap-4 text-neutral-500">
//                         <span>Similarity: ${(rec.similarity * 100).toFixed(1)}%</span>
//                         <span>Popularity: ${rec.popularity}</span>
//                     </div>
//                     <a href="${rec.spotify_url}" target="_blank" class="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition font-semibold">
//                         <span>Open in Spotify</span>
//                         <i data-lucide="external-link" size="14"></i>
//                     </a>
//                 </div>
//             </div>
//         `;
//     });
    
//     html += '</div>';
    
//     resultsTable.innerHTML = html;
//     lucide.createIcons();
// }

// // Smooth scroll for navigation
// document.querySelectorAll('a[href^="#"]').forEach(anchor => {
//     anchor.addEventListener('click', function(e) {
//         e.preventDefault();
//         const target = document.querySelector(this.getAttribute('href'));
//         if (target) {
//             target.scrollIntoView({ behavior: 'smooth' });
//         }
//     });
// });



// Global State
let currentMode = 'standard';

// Initialize Lucide icons
lucide.createIcons();

/**
 * Handle mode selection (Standard vs Hidden Gems)
 */
function selectMode(mode) {
    currentMode = mode;
    
    const standardBtn = document.getElementById('standardMode');
    const hiddenBtn = document.getElementById('hiddenGemsMode');
    const description = document.getElementById('modeDescription');
    
    if (mode === 'standard') {
        standardBtn.classList.remove('inactive');
        standardBtn.classList.add('active');
        hiddenBtn.classList.remove('active');
        hiddenBtn.classList.add('inactive');
        
        description.innerHTML = '<p><strong class="text-emerald-400">Standard Mode:</strong> Finds highest correlation matches for your current vibe across all popularity levels.</p>';
    } else {
        hiddenBtn.classList.remove('inactive');
        hiddenBtn.classList.add('active');
        standardBtn.classList.remove('active');
        standardBtn.classList.add('inactive');
        
        description.innerHTML = '<p><strong class="text-emerald-400">Hidden Gems Mode:</strong> Surfaces underground tracks with high acoustic similarity while penalizing mainstream popularity.</p>';
    }
    
    // Re-render icons
    lucide.createIcons();
}

// DOM Elements
const fileInput = document.getElementById('fileInput');
const resultsTable = document.getElementById('resultsTable');
const modeIndicator = document.getElementById('resultsModeIndicator');
const statsPanel = document.getElementById('statsPanel');

// File input handling
fileInput.addEventListener('change', handleFileUpload);

// Drag and drop functionality
const uploadPanel = document.querySelector('.bento-panel');
uploadPanel.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadPanel.classList.add('border-emerald-500');
});

uploadPanel.addEventListener('dragleave', () => {
    uploadPanel.classList.remove('border-emerald-500');
});

uploadPanel.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadPanel.classList.remove('border-emerald-500');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        handleFileUpload({ target: fileInput });
    }
});

let userProfileData = null; // Store stats for all years here




/**
 * Main Upload Function
 */
async function handleFileUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    if (!file.name.endsWith('.zip')) {
        showError('Please upload a .zip file');
        return;
    }
    
    // Show loading state
    showLoading();
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('mode', currentMode); // Pass current mode to backend
        
        const response = await fetch('/analyze', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Upload failed');
        }
        
        // Display both Results and Stats
        displayResults(data);


        // Save the multi-year stats and initialize tabs
        userProfileData = data.stats; 
        createYearTabs(Object.keys(userProfileData));
        updateProfileView('All Time'); // Default view
        
    } catch (error) {
        showError(error.message);
    }
}

/**
 * Creates the Year Selection Buttons
 */
function createYearTabs(years) {
    const container = document.getElementById('yearTabs');
    container.innerHTML = ''; // Clear "Awaiting Data"
    
    years.forEach(year => {
        const btn = document.createElement('button');
        btn.innerText = year;
        btn.className = 'year-tab px-3 py-1 rounded-lg text-xs font-bold transition-all border border-neutral-800 text-neutral-500 hover:text-white';
        if (year === 'All Time') {
            btn.classList.add('bg-emerald-500', 'text-black', 'border-emerald-500');
            btn.classList.remove('text-neutral-500');
        }
        
        btn.onclick = () => {
            // Update UI Active State
            document.querySelectorAll('.year-tab').forEach(b => {
                b.classList.remove('bg-emerald-500', 'text-black', 'border-emerald-500');
                b.classList.add('text-neutral-500');
            });
            btn.classList.add('bg-emerald-500', 'text-black', 'border-emerald-500');
            btn.classList.remove('text-neutral-500');
            
            // Switch Data
            updateProfileView(year);
        };
        
        container.appendChild(btn);
    });
}


/**
 * Updates the stats values based on selected year
 */
function updateProfileView(year) {
    const stats = userProfileData[year];
    if (!stats) return;

    // Apply numbers with animation or directly
    document.getElementById('stat-total-streams').innerText = stats.total_streams.toLocaleString();
    document.getElementById('stat-top-artist').innerText = stats.top_artist;
    document.getElementById('stat-top-track').innerText = stats.top_track;
    document.getElementById('stat-hours').innerText = stats.total_hours.toLocaleString() + "h";
    document.getElementById('stat-unique').innerText = stats.unique_artists.toLocaleString();
    
    lucide.createIcons();
}

function showLoading() {
    // Reset Stats to a "Loading" look instead of hiding
    document.getElementById('yearTabs').innerHTML = '<span class="text-xs text-emerald-500 animate-pulse font-mono">CALCULATING TIMELINES...</span>';
    document.getElementById('stat-total-streams').innerText = "...";
    document.getElementById('stat-top-artist').innerText = "...";
    document.getElementById('stat-top-track').innerText = "...";
    document.getElementById('stat-hours').innerText = "...";
    document.getElementById('stat-unique').innerText = "...";

    resultsTable.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full">
            <div class="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
            <p class="text-neutral-400 text-sm mb-2">Decoding your music DNA...</p>
        </div>
    `;
}

function showError(message) {
    resultsTable.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-red-400">
            <i data-lucide="alert-circle" class="mb-4"></i>
            <p class="text-sm font-semibold mb-2">Error</p>
            <p class="text-xs text-neutral-500">${message}</p>
        </div>
    `;
    lucide.createIcons();
}

/**
 * Populates the Stats Dashboard
 */
function displayUserStats(stats) {
    if (!stats) return;

    // Remove hidden class and scroll into view
    statsPanel.classList.remove('hidden');

    document.getElementById('stat-total-streams').innerText = stats.total_streams.toLocaleString();
    document.getElementById('stat-top-artist').innerText = stats.top_artist;
    document.getElementById('stat-top-track').innerText = stats.top_track;
    document.getElementById('stat-hours').innerText = stats.total_hours + "h";
    document.getElementById('stat-unique').innerText = stats.unique_artists.toLocaleString();

    // Re-run icons for the stats panel
    lucide.createIcons();
}

/**
 * Renders the Recommendations List
 */
function displayResults(data) {
    const recommendations = data.recommendations;
    const totalStreams = data.total_streams;
    const modeName = data.mode === 'hidden' ? 'Hidden Gems' : 'Standard';
    
    // Update Mode Indicator
    modeIndicator.innerText = `MODE: ${modeName.toUpperCase()}`;

    let html = `
        <div class="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <div class="flex items-center gap-2 text-emerald-400 mb-2">
                <i data-lucide="check-circle" size="18"></i>
                <span class="font-bold text-sm">Analysis Complete</span>
            </div>
            <p class="text-xs text-neutral-400">Processed ${totalStreams.toLocaleString()} streams • Generated ${recommendations.length} recommendations in ${modeName} mode</p>
        </div>
        <div class="space-y-3">
    `;
    
    recommendations.forEach((rec, index) => {
        const scoreColor = rec.vibe_score > 0.8 ? 'text-emerald-400' : 
                          rec.vibe_score > 0.6 ? 'text-yellow-400' : 'text-neutral-400';
        
        html += `
            <div class="bg-neutral-900/50 rounded-xl py-3 px-4 border border-neutral-800 hover:border-emerald-500/50 transition group">
                <!-- Top Row: Info and Score -->
                <div class="flex items-center justify-between gap-4 mb-2">
                    <div class="flex items-center gap-2 overflow-hidden">
                        <span class="text-[10px] font-mono text-neutral-600">#${index + 1}</span>
                        <div class="flex items-baseline gap-2 truncate">
                            <h3 class="font-bold text-white text-sm group-hover:text-emerald-400 transition truncate">
                                ${rec.track_name}
                            </h3>
                            <span class="text-neutral-500 text-xs truncate">— ${rec.artist_name}</span>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-1.5 flex-shrink-0">
                        <div class="text-base font-bold ${scoreColor}">${(rec.vibe_score * 100).toFixed(1)}</div>
                        <div class="text-[12px] text-neutral-600 uppercase tracking-tighter">vibe score</div>
                    </div>
                </div>
                
                <!-- Bottom Row: Metadata and Link -->
                <div class="flex items-center justify-between text-[11px] pt-2 border-t border-neutral-800/50">
                    <div class="flex gap-4 text-neutral-600">
                        <span>Similarity: <span class="text-neutral-400">${(rec.similarity * 100).toFixed(0)}%</span></span>
                        <span>Popularity: <span class="text-neutral-400">${rec.popularity}</span></span>
                    </div>
                    <a href="${rec.spotify_url}" target="_blank" class="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition font-bold">
                        <span>Listen</span>
                        <i data-lucide="external-link" size="12"></i>
                    </a>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    resultsTable.innerHTML = html;
    lucide.createIcons();
}

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});