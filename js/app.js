// Function to load AI recommendations
function loadAIRecommendations() {
    const container = document.getElementById('ai-recommendations-container');
    
    // Add null check
    if (!container) {
        console.warn('AI recommendations container not found');
        return;
    }
    
    // Sample recommendations
    const recommendations = [
        {
            name: "Dr. Siti Rahayu",
            specialty: "Marine Biology",
            match_score: 0.95
        },
        {
            name: "PT. Maritim Tech",
            specialty: "Ocean IoT",
            match_score: 0.88
        }
    ];
    
    container.innerHTML = recommendations.map(rec => `
        <div class="recommendation-card">
            <h4>${rec.name}</h4>
            <p>${rec.specialty}</p>
            <span class="match-score">${(rec.match_score * 100).toFixed(0)}% Match</span>
        </div>
    `).join('');
}

// Call with delay or on specific event
// loadAIRecommendations();
