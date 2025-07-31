const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise'); // Using promise-based API for async/await
const { exec } = require('child_process'); // For executing system commands for printing

const app = express();
const port = 3000; // Ensure this matches your frontend's API_BASE_URL

// MySQL Database configuration
// IMPORTANT: Replace with your MySQL credentials
const dbConfig = {
    host: 'localhost',
    user: 'root', // Default XAMPP MySQL user
    password: '', // Default XAMPP MySQL password
    database: 'queue_system', // The database you created
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool; // Connection pool for MySQL

// Function to initialize the database connection
async function initializeDb() {
    try {
        pool = mysql.createPool(dbConfig);
        await pool.getConnection(); // Try to get a connection to test
        console.log('Connected to MySQL database.');

        // Optional: Check if tables exist and seed data (usually done manually for MySQL)
        // This is primarily for quick dev setup if you don't import the .sql directly.
        await pool.query(`CREATE TABLE IF NOT EXISTS branches (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE
        )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS service_windows (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            window_number INT NOT NULL,
            branch_id VARCHAR(255) NOT NULL,
            FOREIGN KEY (branch_id) REFERENCES branches(id)
        )`);
        await pool.query(`CREATE TABLE IF NOT EXISTS queue_tickets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            queue_number VARCHAR(255) NOT NULL UNIQUE,
            customer_name VARCHAR(255) NOT NULL,
            customer_nickname VARCHAR(255) NOT NULL,
            category VARCHAR(255) NOT NULL,
            branch_id VARCHAR(255) NOT NULL,
            service_window_id VARCHAR(255) NOT NULL,
            issue_time DATETIME NOT NULL,
            FOREIGN KEY (branch_id) REFERENCES branches(id),
            FOREIGN KEY (service_window_id) REFERENCES service_windows(id)
        )`);

        // Seed initial data if tables are empty (for testing)
        // Ensure queue_system_db.sql is imported manually for proper seeding
        const [rows] = await pool.query("SELECT COUNT(*) as count FROM branches");
        if (rows[0].count === 0) {
            console.log("Seeding initial data (if not already present from SQL import)...");
            await pool.query(`INSERT IGNORE INTO branches (id, name) VALUES ('b1', 'Main Branch'), ('b2', 'Downtown Branch'), ('b3', 'Uptown Branch')`);
            await pool.query(`INSERT IGNORE INTO service_windows (id, name, window_number, branch_id) VALUES ('w1a', 'Deposits', 1, 'b1'), ('w1b', 'Withdrawals', 2, 'b1'), ('w1c', 'Loan Applications', 3, 'b1'), ('w2a', 'Account Opening', 1, 'b2'), ('w2b', 'Customer Service', 2, 'b2'), ('w3a', 'General Inquiries', 1, 'b3')`);
        }

    } catch (err) {
        console.error('Error connecting to or initializing database:', err.message);
        process.exit(1); // Exit if DB connection fails
    }
}

// Middleware setup
app.use(cors()); // Use CORS to allow requests from your frontend
app.use(express.json()); // Middleware to parse JSON bodies

// --- API Endpoints ---

// GET /branches - Get all branches from DB
app.get('/branches', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name FROM branches');
        res.json(rows.map(row => ({ _id: row.id, name: row.name })));
    } catch (err) {
        console.error('Error fetching branches:', err);
        res.status(500).json({ error: 'Failed to fetch branches.' });
    }
});

// GET /branches/:branchId/windows - Get service windows for a specific branch from DB
app.get('/branches/:branchId/windows', async (req, res) => {
    const { branchId } = req.params;
    try {
        const [rows] = await pool.query('SELECT id, name, window_number FROM service_windows WHERE branch_id = ?', [branchId]);
        res.json(rows.map(row => ({
            _id: row.id,
            name: row.name,
            windowNumber: row.window_number
        })));
    } catch (err) {
        console.error('Error fetching service windows:', err);
        res.status(500).json({ error: 'Failed to fetch service windows.' });
    }
});

// POST /queue/issue - Issue a new queue number
app.post('/queue/issue', async (req, res) => {
    const { customerName, customerNickname, category, branchId, windowId } = req.body;

    if (!customerName || !customerNickname || !category || !branchId || !windowId) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const [branches] = await pool.query('SELECT name FROM branches WHERE id = ?', [branchId]);
        const branch = branches[0];
        if (!branch) {
            return res.status(404).json({ message: 'Branch not found.' });
        }

        const [windows] = await pool.query('SELECT name, window_number FROM service_windows WHERE id = ? AND branch_id = ?', [windowId, branchId]);
        const transactionWindow = windows[0];
        if (!transactionWindow) {
            return res.status(404).json({ message: 'Service window not found for this branch.' });
        }

        // Get last queue number and increment
        const [lastTickets] = await pool.query('SELECT queue_number FROM queue_tickets ORDER BY id DESC LIMIT 1');
        let currentQueueNumber = 100; // Starting queue number if no tickets exist
        if (lastTickets.length > 0 && lastTickets[0].queue_number) {
            const lastNum = parseInt(lastTickets[0].queue_number.split('-')[1]);
            if (!isNaN(lastNum)) {
                currentQueueNumber = lastNum + 1;
            }
        }
        const newQueueNumber = `Q-${currentQueueNumber}`;
        const dateTimeIssued = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format for MySQL DATETIME

        await pool.query(
            `INSERT INTO queue_tickets (queue_number, customer_name, customer_nickname, category, branch_id, service_window_id, issue_time) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [newQueueNumber, customerName, customerNickname, category, branchId, windowId, dateTimeIssued]
        );

        const queueTicket = {
            queueNumber: newQueueNumber,
            customerName,
            customerNickname,
            category,
            branchId,
            branch: { _id: branchId, name: branch.name },
            windowId,
            transactionWindow: { _id: windowId, name: transactionWindow.name, windowNumber: transactionWindow.window_number },
            dateTimeIssued,
        };
        console.log('Issued Queue Ticket:', queueTicket);
        res.status(201).json(queueTicket);

    } catch (err) {
        console.error('Error issuing queue number:', err);
        res.status(500).json({ message: 'Failed to issue queue number due to database error.' });
    }
});

// Set up Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() }); // Store the file in memory as a Buffer

// Create a temporary directory for PDFs if it doesn't exist
const tempPdfDir = path.join(__dirname, 'temp_pdfs');
if (!fs.existsSync(tempPdfDir)) {
    fs.mkdirSync(tempPdfDir);
}

// POST /send-pdf endpoint
app.post('/send-pdf', upload.single('pdf'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No PDF file uploaded.' });
    }

    const pdfBuffer = req.file.buffer; // The PDF file content as a Buffer
    const filename = req.file.originalname;
    const { queueNumber, branchName, category } = req.body; // Additional data from frontend

    const tempFilePath = path.join(tempPdfDir, filename);

    fs.writeFile(tempFilePath, pdfBuffer, (err) => {
        if (err) {
            console.error('Error saving PDF temporarily:', err);
            return res.status(500).json({ message: 'Failed to save PDF temporarily on server.' });
        }
        console.log(`PDF saved temporarily to: ${tempFilePath}`);
        console.log(`Associated Queue Number: ${queueNumber}`);
        console.log(`Associated Branch Name: ${branchName}`);
        console.log(`Associated Category: ${category}`);

        // --- USB Printer / External Printer Logic ---
        // This leverages the operating system's print capabilities.
        // Ensure your USB printer is installed and configured on the server machine.

        let command = '';
        const printerName = 'YOUR_USB_PRINTER_NAME'; // <<< IMPORTANT: Replace with the exact name of your USB printer as it appears in Windows/CUPS

        if (process.platform === 'win32') {
            // For Windows:
            // Option 1 (Recommended for silent printing if a viewer like Adobe Reader is installed):
            // Requires Adobe Reader or similar to be installed and correctly invoked.
            // The /t flag prints the file to the specified printer and then exits.
            // Replace "C:\\Program Files\\Adobe\\Acrobat Reader DC\\Reader\\AcroRd32.exe" with your actual path if different.
            // command = `C:\\Program Files\\Adobe\\Acrobat Reader DC\\Reader\\AcroRd32.exe /t "${tempFilePath}" "${printerName}"`;

            // Option 2 (Less reliable for PDFs, might open viewer or prompt):
            // This command tells Windows to open the PDF file with its default associated program.
            // It might open a print dialog or the PDF viewer itself.
            command = `start /min "" "${tempFilePath}"`;
            console.warn('Windows printing via `start` command initiated. Ensure a PDF viewer is associated or use `/t` with printer name for silent printing.');
            console.warn(`If using /t, make sure to replace 'YOUR_USB_PRINTER_NAME' with your actual printer name.`);

            // Option 3 (Using built-in 'print' command, primarily for text files, often fails for PDFs):
            // command = `print /d:"${printerName}" "${tempFilePath}"`;
            // console.warn('Using `print` command. This often works only for text files, not PDFs.');

        } else if (process.platform === 'linux' || process.platform === 'darwin') { // For Linux and macOS
            // 'lp' is the standard CUPS command to print a file.
            // Ensure CUPS is configured and the USB printer is set up in CUPS.
            // If you want to specify a printer by name: `lp -d "${printerName}" "${tempFilePath}"`
            command = `lp "${tempFilePath}"`;
            console.log(`Linux/macOS printing via 'lp' command initiated. If you have multiple printers, consider 'lp -d "${printerName}" "${tempFilePath}"'`);
        } else {
            console.error('Unsupported operating system for direct command-line printing.');
            return res.status(500).json({ message: 'Server operating system not supported for direct printing.' });
        }

        if (!command) {
             return res.status(500).json({ message: 'No valid print command could be constructed for your OS.' });
        }

        console.log(`Attempting to print using command: ${command}`);

        exec(command, (error, stdout, stderr) => {
            // Clean up the temporary file regardless of print success/failure
            fs.unlink(tempFilePath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting temporary PDF:', unlinkErr);
                else console.log(`Temporary PDF deleted: ${tempFilePath}`);
            });

            if (error) {
                console.error(`Printing error: ${error.message}`);
                console.error(`stderr: ${stderr}`);
                return res.status(500).json({
                    message: `Failed to send PDF to printer. Error: ${error.message}. Stderr: ${stderr}`,
                    details: `Ensure your USB printer is correctly installed and configured on the server, and the appropriate printing command is available for your OS (${process.platform}). Check if a PDF reader is set up to print silently if using Windows.`
                });
            }

            if (stderr) {
                // Some commands might output to stderr even for non-errors (e.g., warnings)
                console.warn(`Printing warning/info (stderr): ${stderr}`);
            }

            console.log(`Print command stdout: ${stdout}`);
            console.log("PDF successfully sent to the system's print queue.");

            res.status(200).json({
                message: 'PDF received by backend and sent to print queue.',
                filename: filename,
                queueNumber: queueNumber
            });
        });
    });
});

// Start the server after database initialization
initializeDb().then(() => {
    app.listen(port, () => {
        console.log(`Backend server listening at http://localhost:${port}`);
        console.log(`Frontend should connect to: http://localhost:${port}`);
    });
});