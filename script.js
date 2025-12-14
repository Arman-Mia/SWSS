// -----------------------------------------------------------------
// CONFIGURATION
// -----------------------------------------------------------------
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/UHqa5balb/";

// Define the exact lists you wanted for each category
const wasteInfo = {
    "Organic": [
        "Fruit peels", 
        "Vegetable waste", 
        "Cooked food", 
        "Dry leaves", 
        "Garden waste"
    ],
    "Paper": [
        "Newspaper", 
        "Cardboard", 
        "Paper plates", 
        "Paper bags", 
        "Books"
    ],
    "Plastic": [
        "Water bottles", 
        "Wrappers", 
        "Containers", 
        "Polythene bags"
    ],
    "Glass": [
        "Bottles", 
        "Jars", 
        "Cups", 
        "Broken glass"
    ],
    "Metal": [
        "Cans", 
        "Tin foil", 
        "Bottle caps", 
        "Metal utensils"
    ]
};

// Global variables
let model, maxPredictions;

// -----------------------------------------------------------------
// INITIALIZATION
// -----------------------------------------------------------------
async function init() {
    const modelURL = MODEL_URL + "model.json";
    const metadataURL = MODEL_URL + "metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        console.log("AI Model Loaded Successfully");
    } catch (error) {
        console.error("Error loading model:", error);
        alert("Error loading the AI model. Please check your internet connection.");
    }
}

// Load model immediately when page opens
init();

// -----------------------------------------------------------------
// CORE LOGIC
// -----------------------------------------------------------------

function handleUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Show image and hide upload button
            const imgElement = document.getElementById('uploaded-image');
            imgElement.src = e.target.result;
            
            document.querySelector('.upload-section').style.display = 'none';
            document.getElementById('preview-container').style.display = 'block';
            document.getElementById('loading').style.display = 'block';
            document.getElementById('result-container').style.display = 'none';

            // Wait slightly for image to render, then predict
            setTimeout(predict, 500);
        };

        reader.readAsDataURL(input.files[0]);
    }
}

async function predict() {
    if (!model) {
        alert("Model is still loading. Please wait a moment and try again.");
        document.getElementById('loading').style.display = 'none';
        document.querySelector('.upload-section').style.display = 'block';
        return;
    }

    const image = document.getElementById("uploaded-image");
    const prediction = await model.predict(image);

    // Find the highest probability prediction
    let highestProbability = 0;
    let bestClass = "";

    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > highestProbability) {
            highestProbability = prediction[i].probability;
            bestClass = prediction[i].className;
        }
    }

    displayResult(bestClass, highestProbability);
}

function displayResult(className, probability) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('result-container').style.display = 'block';

    // 1. Show the Name
    document.getElementById('label-name').innerText = className;
    
    // 2. Show Confidence
    document.getElementById('confidence').innerText = 
        "Confidence: " + (probability * 100).toFixed(2) + "%";

    // 3. Show Specific Details List
    const detailsContainer = document.getElementById('result-details');
    
    // Check if we have info for this class, otherwise show default message
    // We use className directly. If your model uses "Class 1", "Class 2", etc., 
    // you might need to adjust the keys in wasteInfo.
    if (wasteInfo[className]) {
        let htmlList = "<ul>";
        wasteInfo[className].forEach(item => {
            htmlList += `<li>${item}</li>`;
        });
        htmlList += "</ul>";
        detailsContainer.innerHTML = htmlList;
    } else {
        detailsContainer.innerHTML = "<p>No specific details found for this category.</p>";
    }
}

function resetApp() {
    document.getElementById('image-input').value = ""; // Clear file input
    document.querySelector('.upload-section').style.display = 'block';
    document.getElementById('preview-container').style.display = 'none';
    document.getElementById('result-container').style.display = 'none';
}