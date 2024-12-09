const https = require('https');
const fs = require('fs');
const path = require('path');

const ephemerisFiles = [
    'sepl.se1',    // Planets
    'semo.se1',    // Moon
    'seas.se1',    // Asteroids
    'sema.se1',    // Main asteroids
    'sepl.txt',    // Planet names
    'seas.txt',    // Asteroid names
    'semo.txt',    // Moon data
];

const baseUrl = 'https://raw.githubusercontent.com/aloistr/swisseph/master/ephe/';
const epheDir = path.join(process.cwd(), 'ephe');

// Create ephe directory if it doesn't exist
if (!fs.existsSync(epheDir)) {
    fs.mkdirSync(epheDir);
}

function downloadFile(filename) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(epheDir, filename);
        const file = fs.createWriteStream(filePath);
        
        console.log(`Downloading ${filename}...`);
        const url = baseUrl + filename;
        console.log(`URL: ${url}`);
        
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
                return;
            }

            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded ${filename}`);
                resolve();
            });

            file.on('error', (err) => {
                fs.unlink(filePath, () => {});
                reject(err);
            });
        }).on('error', (err) => {
            fs.unlink(filePath, () => {});
            reject(err);
        });
    });
}

async function downloadAllFiles() {
    console.log('Downloading ephemeris files...');
    for (const file of ephemerisFiles) {
        try {
            await downloadFile(file);
        } catch (error) {
            console.error(`Error downloading ${file}:`, error.message);
            // Continue with next file even if one fails
        }
    }
    console.log('Download process completed');
}

downloadAllFiles();
