"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { useState } from "react";
import { CONTRACTS } from "../lib/contracts";

const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

interface TxRecord {
  hash: string;
  token: string;
  to: string;
  amount: string;
  time: string;
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [recipients, setRecipients] = useState([{ address: "", amount: "" }]);
  const [txHistory, setTxHistory] = useState<TxRecord[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

const token = CONTRACTS[selectedToken as keyof typeof CONTRACTS];
  const { data: usdcBalance } = useBalance({ address, token: CONTRACTS.USDC.address as `0x${string}` });
  const { data: eurcBalance } = useBalance({ address, token: CONTRACTS.EURC.address as `0x${string}` });
  const { writeContractAsync } = useWriteContract();

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  }

  function addRecipient() {
    setRecipients([...recipients, { address: "", amount: "" }]);
  }

  function removeRecipient(index: number) {
    setRecipients(recipients.filter((_, i) => i !== index));
  }

  function updateRecipient(index: number, field: "address" | "amount", value: string) {
    const updated = [...recipients];
    updated[index][field] = value;
    setRecipients(updated);
  }

  async function handleSend() {
    setIsSending(true);
    try {
      for (const recipient of recipients) {
        if (!recipient.address || !recipient.amount) continue;
        const hash = await writeContractAsync({
          address: token.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "transfer",
          args: [recipient.address as `0x${string}`, parseUnits(recipient.amount, token.decimals)],
        });
        const record: TxRecord = {
          hash,
          token: selectedToken,
          to: recipient.address,
          amount: recipient.amount,
          time: new Date().toLocaleTimeString(),
        };
        setTxHistory((prev) => [record, ...prev]);
      }
      showToast("success", "Transaction sent successfully!");
      setRecipients([{ address: "", amount: "" }]);
    } catch (e: any) {
      showToast("error", e?.shortMessage ?? e?.message ?? "Transaction failed");
    } finally {
      setIsSending(false);
    }
  }

  const isValid = recipients.every((r) => r.address && r.amount);
  const explorerUrl = "https://testnet.arcscan.app";

  return (
    <main style={{ minHeight: "100vh", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", fontFamily: "system-ui, sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "24px", right: "24px", zIndex: 1000,
          background: toast.type === "success" ? "#166534" : "#991B1B",
          color: "#fff", borderRadius: "14px", padding: "16px 20px",
          fontSize: "14px", fontWeight: 600, maxWidth: "320px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          animation: "slideIn 0.3s ease",
        }}>
          <div style={{ marginBottom: "4px" }}>
            {toast.type === "success" ? "✓ Success" : "✕ Error"}
          </div>
          <div style={{ fontWeight: 400, fontSize: "13px", opacity: 0.9 }}>{toast.message}</div>
        </div>
      )}

      <div style={{ width: "100%", maxWidth: "500px", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Main Card */}
        <div style={{ background: "#1E293B", borderRadius: "24px", border: "1px solid #334155", padding: "2rem" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#F8FAFC", margin: "0 0 2px" }}>Arc Transfer</h1>
              <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>Arc Testnet</p>
            </div>
            <ConnectButton showBalance={false} />
          </div>

          {isConnected && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Token Selector */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {["USDC", "EURC"].map((t) => {
                  const c = CONTRACTS[t];
                  const bal = t === "USDC" ? usdcBalance : eurcBalance;
                  const selected = selectedToken === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setSelectedToken(t)}
                      style={{
                        border: selected ? "2px solid #3B82F6" : "1px solid #334155",
                        borderRadius: "16px", padding: "16px", textAlign: "left",
                        background: selected ? "#1D3461" : "#0F172A", cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "15px", color: "#F8FAFC" }}>{c.symbol}</div>
                      <div style={{ fontSize: "11px", color: "#64748B", marginBottom: "6px" }}>{c.name}</div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: selected ? "#60A5FA" : "#94A3B8" }}>
                        {bal ? Number(bal.formatted).toFixed(2) : "0.00"} {c.symbol}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Recipients */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#94A3B8" }}>Recipients</span>
                  <button onClick={addRecipient} style={{ fontSize: "12px", color: "#60A5FA", background: "#1D3461", border: "none", borderRadius: "8px", padding: "4px 12px", cursor: "pointer", fontWeight: 600 }}>
                    + Add
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {recipients.map((r, i) => (
                    <div key={i} style={{ background: "#0F172A", borderRadius: "14px", padding: "14px", border: "1px solid #334155" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748B" }}>#{i + 1}</span>
                        {recipients.length > 1 && (
                          <button onClick={() => removeRecipient(i)} style={{ fontSize: "12px", color: "#F87171", background: "none", border: "none", cursor: "pointer" }}>
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Wallet address (0x...)"
                        value={r.address}
                        onChange={(e) => updateRecipient(i, "address", e.target.value)}
                        style={{ width: "100%", boxSizing: "border-box" as const, padding: "10px 14px", borderRadius: "10px", border: "1px solid #334155", fontSize: "13px", background: "#1E293B", color: "#F8FAFC", outline: "none", marginBottom: "8px", fontFamily: "monospace" }}
                      />
                      <input
                        type="number"
                        placeholder={"Amount in " + selectedToken}
                        value={r.amount}
                        onChange={(e) => updateRecipient(i, "amount", e.target.value)}
                        style={{ width: "100%", boxSizing: "border-box" as const, padding: "10px 14px", borderRadius: "10px", border: "1px solid #334155", fontSize: "13px", background: "#1E293B", color: "#F8FAFC", outline: "none" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={isSending || !isValid}
                style={{ width: "100%", background: isSending || !isValid ? "#1E293B" : "linear-gradient(135deg, #3B82F6, #6366F1)", color: isSending || !isValid ? "#475569" : "#fff", border: "1px solid #334155", borderRadius: "14px", padding: "15px", fontSize: "15px", fontWeight: 700, cursor: isSending || !isValid ? "not-allowed" : "pointer" }}
              >
                {isSending ? "Sending..." : "Send " + selectedToken}
              </button>

            </div>
          )}
        </div>

        {/* Transaction History */}
        {txHistory.length > 0 && (
          <div style={{ background: "#1E293B", borderRadius: "24px", border: "1px solid #334155", padding: "1.5rem" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#94A3B8", margin: "0 0 12px" }}>Transaction History</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {txHistory.map((tx, i) => (
                
                  <a key={i}
                  href={explorerUrl + "/tx/" + tx.hash}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0F172A", borderRadius: "12px", padding: "12px 14px", textDecoration: "none", border: "1px solid #334155" }}
                >
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#F8FAFC" }}>
                      {tx.amount} {tx.token}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748B", fontFamily: "monospace", marginTop: "2px" }}>
                      {tx.to.slice(0, 10) + "..." + tx.to.slice(-6)}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11px", color: "#60A5FA" }}>View →</div>
                    <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>{tx.time}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}