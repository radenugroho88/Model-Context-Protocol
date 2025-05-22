import { SolanaAgentKit, KeypairWallet } from "solana-agent-kit";
import { startMcpServer } from '@solana-agent-kit/adapter-mcp';
import TokenPlugin from '@solana-agent-kit/plugin-token';
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize wallet with private key from environment
const wallet = new KeypairWallet(process.env.SOLANA_PRIVATE_KEY);

// Create agent with plugin
const agent = new SolanaAgentKit(
  wallet,
  process.env.RPC_URL,
  {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  }
).use(TokenPlugin);

// Select which actions to expose to the MCP server
const finalActions = {
  BALANCE_ACTION: agent.actions.find((action) => action.name === "BALANCE_ACTION"),
  TOKEN_BALANCE_ACTION: agent.actions.find((action) => action.name === "TOKEN_BALANCE_ACTION"),
  GET_WALLET_ADDRESS_ACTION: agent.actions.find((action) => action.name === "GET_WALLET_ADDRESS_ACTION"),
};

// Start the MCP server
startMcpServer(finalActions, agent, { name: "solana-agent", version: "0.0.1" });