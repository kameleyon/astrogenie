const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const { promisify } = require('util');
const stream = require('stream');
const pipeline = promisify(stream.pipeline);

const EPHE_FILES = [
    { name: 'seas_18.se1', minSize: 200000 },   // Asteroid ephemeris
    { name: 'semo_18.se1', minSize: 1200000 },  // Moon ephemeris
    { name: 'sepl_18.se1', minSize: 400000 }    // Planets ephemeris
];

// Official Swiss Ephemeris download location
const EPHE_BASE_URL = 'https://www.astro.com/ftp/swisseph/ephe/';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadFile(url, destPath, retries = 0) {
    try {
        console.log(`Downloading ${path.basename(url)}...`);
        const response = await new Promise((resolve, reject) => {
            https.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            }, response => {
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                    return;
                }
                resolve(response);
            }).on('error', reject);
        });

        await pipeline(response, fs.createWriteStream(destPath));
        console.log(`Downloaded ${path.basename(url)}`);
    } catch (error) {
        if (retries < MAX_RETRIES) {
            console.log(`Retry ${retries + 1}/${MAX_RETRIES} for ${path.basename(url)}`);
            await sleep(RETRY_DELAY);
            return downloadFile(url, destPath, retries + 1);
        }
        throw error;
    }
}

async function verifyFile(filePath, minSize) {
    try {
        const stats = await fs.stat(filePath);
        return stats.size >= minSize;
    } catch {
        return false;
    }
}

async function main() {
    try {
        // Create ephe directory if it doesn't exist
        const epheDir = path.join(process.cwd(), 'ephe');
        try {
            await fs.mkdir(epheDir, { recursive: true });
        } catch (err) {
            if (err.code !== 'EEXIST') {
                throw err;
            }
        }

        // Check which files need to be downloaded or re-downloaded
        const filesToDownload = [];
        for (const file of EPHE_FILES) {
            const filePath = path.join(epheDir, file.name);
            const isValid = await verifyFile(filePath, file.minSize);
            
            if (!isValid) {
                console.log(`${file.name} needs to be ${isValid === false ? 're-' : ''}downloaded`);
                filesToDownload.push(file);
            } else {
                console.log(`${file.name} is valid`);
            }
        }

        // Download or re-download files
        if (filesToDownload.length > 0) {
            console.log(`\nDownloading ${filesToDownload.length} files...`);
            for (const file of filesToDownload) {
                const url = EPHE_BASE_URL + file.name;
                const destPath = path.join(epheDir, file.name);
                
                try {
                    await downloadFile(url, destPath);
                    // Verify after download
                    const isValid = await verifyFile(destPath, file.minSize);
                    if (!isValid) {
                        throw new Error(`Downloaded file ${file.name} is invalid or corrupted`);
                    }
                } catch (error) {
                    console.error(`Failed to download ${file.name}:`, error.message);
                    process.exit(1);
                }
            }
            console.log('\nAll files downloaded successfully!');
        } else {
            console.log('\nAll ephemeris files are valid.');
        }

        // Final verification
        console.log('\nVerifying all files...');
        let allValid = true;
        for (const file of EPHE_FILES) {
            const filePath = path.join(epheDir, file.name);
            const stats = await fs.stat(filePath);
            const size = (stats.size / 1024 / 1024).toFixed(2);
            const isValid = stats.size >= file.minSize;
            
            console.log(`${file.name}: ${size} MB ${isValid ? '✓' : '✗'}`);
            if (!isValid) {
                allValid = false;
                console.error(`${file.name} is smaller than expected (${file.minSize} bytes required)`);
            }
        }

        if (!allValid) {
            throw new Error('Some files are invalid or corrupted');
        }

        console.log('\nAll files verified successfully!');

    } catch (error) {
        console.error('\nError:', error.message);
        process.exit(1);
    }
}

main();
