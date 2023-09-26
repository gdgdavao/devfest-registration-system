import 'dotenv/config';
import * as unzipper from 'unzipper';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 *
 * @param {string} pbPath
 */
function pull(pbPath) {
    console.log('PULLING...');

    console.log('Generating TypeScript definitions...');
    exec('npm run generate-types');

    console.log('Copying PB pb_hooks to repo pb_hooks...');
    fs.cpSync(path.join(pbPath, 'pb_hooks'), path.join(__dirname, 'pb', 'pb_hooks'), { force: true, recursive: true });

    console.log('Copying PB data...');

    const zipPath = path.join(__dirname, 'pb', 'backup.zip');
    if (fs.existsSync(zipPath)) {
        // Remove backup.zip first
        fs.rmSync(zipPath);
    }

    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    const filesToCopy = ['data.db', 'data.db-shm', 'logs.db', 'logs.db-shm', 'logs.db-wal', 'types.d.ts'];

    for (const fileName of filesToCopy) {
        const filePath = path.join(pbPath, 'pb_data', fileName);
        if (!fs.existsSync(filePath)) {
            continue;
        }

        archive.file(filePath, { name: fileName });
    }

    archive.finalize();
    archive.pipe(output);

    console.log('SUCCESS. commit your changes to repo upstream')
}

/**
 *
 * @param {string} pbPath
 */
function push(pbPath) {
    console.log('PUSHING...');

    console.log('Copying pb_hooks to PB directory');
    fs.cpSync(path.join(__dirname, 'pb', 'pb_hooks'), path.resolve(pbPath, 'pb_hooks'), { recursive: true, force: true });

    console.log('Copying backup.zip data to PB directory.');
    fs.createReadStream(path.join(__dirname, 'pb', 'backup.zip'))
        .pipe(unzipper.Extract({ path: path.resolve(pbPath, 'pb_data'), forceStream: true }));

    console.log('SUCCESS. Restart your running pocketbase instance.');
}

function main() {
    if (!process.env.PB_PATH) {
        console.error('ERROR: PocketBase path not found. Please specify the full path of your pocketbase folder inside .env file');
        return;
    }

    const command = process.argv[process.argv.length - 1];
    const pbPath = path.resolve(process.env.PB_PATH);

    if (command === 'pull') {
        pull(pbPath);
    } else if (command === 'push') {
        push(pbPath);
    } else {
        console.error(`ERROR: command "${command}" not found. only "push" or "pull" are available.`);
    }
}

main();
