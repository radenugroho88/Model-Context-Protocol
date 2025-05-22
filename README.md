Solana MCP Server untuk Claude Desktop
Deskripsi
Proyek ini adalah server MCP (Model Context Protocol) yang menggunakan solana-agent-kit untuk berinteraksi dengan blockchain Solana. Server ini mendukung aksi seperti memeriksa saldo, saldo token, dan alamat dompet melalui TokenPlugin. Proyek ini diintegrasikan dengan Claude Desktop melalui konfigurasi claude_desktop_config.json.
Prasyarat

Solana CLI (opsional, untuk generate kunci)
Editor teks (misalnya, VS Code, Cursor, dll)
Sistem operasi: Windows, macOS, atau Linux

Instalasi

Buat Direktori Proyek:
mkdir solana-agent-mcp
cd solana-agent-mcp
npm init -y


Install Dependensi:
npm install solana-agent-kit@latest @solana-agent-kit/adapter-mcp@latest @solana-agent-kit/plugin-token@latest @solana/web3.js@latest dotenv@latest


Buat File .env:

Buat file .env di direktori proyek:
RPC_URL=
SOLANA_PRIVATE_KEY=your_private_key_here
OPENAI_API_KEY=your_openai_api_key # Opsional


Generate private key (jika belum punya):solana-keygen new --outfile keypair.json


Salin private key ke .env.


Buat File index.js:

Salin kode berikut ke index.js:import { SolanaAgentKit, KeypairWallet } from "solana-agent-kit";
import { startMcpServer } from '@solana-agent-kit/adapter-mcp';
import TokenPlugin from '@solana-agent-kit/plugin-token';
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Validate environment variables
if (!process.env.SOLANA_PRIVATE_KEY || !process.env.RPC_URL) {
  throw new Error("Missing required environment variables: SOLANA_PRIVATE_KEY or RPC_URL");
}

// Initialize wallet with private key from environment
let wallet;
try {
  wallet = new KeypairWallet(process.env.SOLANA_PRIVATE_KEY);
} catch (error) {
  throw new Error(`Failed to initialize wallet: ${error.message}`);
}

// Create agent with plugin
const agent = new SolanaAgentKit(
  wallet,
  process.env.RPC_URL,
  {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  }
).use(TokenPlugin);

// Log available actions
console.log("Available actions:", agent.actions.map(a => ({ name: a.name, schema: !!a.schema })));

// Select which actions to expose to the MCP server
const finalActions = {
  BALANCE_ACTION: agent.actions.find((action) => action.name === "BALANCE_ACTION"),
  TOKEN_BALANCE_ACTION: agent.actions.find((action) => action.name === "TOKEN_BALANCE_ACTION"),
  GET_WALLET_ADDRESS_ACTION: agent.actions.find((action) => action.name === "GET_WALLET_ADDRESS_ACTION"),
};

// Validate actions
for (const [key, action] of Object.entries(finalActions)) {
  if (!action || !action.schema) {
    console.warn(`Action ${key} is undefined or missing schema, removing`);
    delete finalActions[key];
  }
}
if (Object.keys(finalActions).length === 0) {
  throw new Error("No valid actions with schema found");
}

// Start the MCP server
startMcpServer(finalActions, agent, { name: "solana-agent", version: "0.0.1" })
  .catch(error => {
    console.error("Failed to start MCP server:", error.message);
    process.exit(1);
  });




Konfigurasi Claude Desktop:

Buat/edit claude_desktop_config.json di:
"/path/to/solana-mcp/build/index.js"

Isi:{
  "mcpServers": {
    "solana-mcp": {
      "command": "node",
      "args": [
       "/path/to/solana-mcp/build/index.js"
      ],
      "env": {
        "RPC_URL": "https://api.devnet.solana.com",
        "SOLANA_PRIVATE_KEY": "your_private_key_here",
        "OPENAI_API_KEY": "your_openai_api_key"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}

Jalankan Server:
cd "C:\Users\crypt\Documents\Model Context Protocol\solana-agent-mcp"
node index.js

Restart Claude Desktop:

Tutup dan buka kembali Claude Desktop.


Mengatasi Error

Error: Cannot read properties of undefined (reading 'schema'):
Periksa output Available actions untuk memastikan aksi seperti BALANCE_ACTION ada.
Ganti nama aksi di finalActions sesuai output log (misalnya, balance alih-alih BALANCE_ACTION).

Error: Invalid Private Key:
Validasi kunci:node -e "const bs58 = require('bs58'); console.log(bs58.decode('your_private_key_here').length)"

Output harus 64.

Error: Module Not Found:
Install ulang dependensi:npm install solana-agent-kit@latest @solana-agent-kit/adapter-mcp@latest @solana-agent-kit/plugin-token@latest @solana/web3.js@latest dotenv@latest

Keamanan

Simpan SOLANA_PRIVATE_KEY di .env, jangan hardcode.
Gunakan https://api.devnet.solana.com untuk pengujian.
Tambahkan .env ke .gitignore.
