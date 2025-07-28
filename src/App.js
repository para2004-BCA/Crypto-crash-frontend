import React, { useEffect, useState } from "react";
import socket from "./socket";
import { registerUser, loginUser, placeBet, withdrawAmount } from "./api";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashed, setCrashed] = useState(false);
  const [error, setError] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(true);
  const [currency, setCurrency] = useState("BTC");
  const [usdAmount, setUsdAmount] = useState(10);
  const [withdrawAmountValue, setWithdrawAmountValue] = useState(0);

  useEffect(() => {
    socket.on("tick", (data) => {
      const value = parseFloat(data.multiplier);
      setMultiplier(isNaN(value) ? 1.0 : value);
    });

    socket.on("crash", () => {
      setCrashed(true);
    });

    socket.on("new-round", () => {
      setCrashed(false);
    });

    return () => {
      socket.off("tick");
      socket.off("crash");
      socket.off("new-round");
    };
  }, []);

  const handleAuth = async () => {
    setError("");
    try {
      const res = isRegisterMode
        ? await registerUser(username)
        : await loginUser(username);
      setUser(res.player);
      setUsername("");
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    }
  };

  const handlePlaceBet = async () => {
    if (!user) return alert("You must register or login first!");
    const price = 30000;
    const data = {
      playerId: user.id,
      usdAmount: parseFloat(usdAmount),
      currency,
      price,
    };

    try {
      const response = await placeBet(data);
      socket.emit("place-bet", data);
      console.log("Bet placed via socket:", data);
      setError("");
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to place bet";
      setError(msg);
    }
  };

  const handleWithdraw = async () => {
    if (!user) return alert("Login first to withdraw");
    try {
      const res = await withdrawAmount({
        playerId: user.id,
        amount: parseFloat(withdrawAmountValue),
        currency,
      });
      alert("Withdrawal successful");
      setUser((prev) => ({
        ...prev,
        wallets: res.newBalance,
      }));
      setWithdrawAmountValue(0);
      setError("");
    } catch (err) {
      const msg = err.response?.data?.error || "Withdraw failed";
      setError(msg);
    }
  };

  return (
    <div className="contener" style={{ textAlign: "center", marginTop: "50px", fontFamily: "Arial" }}>
      <h1 className="hidding"> Crypto Crash Game</h1>

      {!user ? (
        <>
          <h3>{isRegisterMode ? "Register" : "Login"} to Play</h3>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
          <br />
          <button onClick={handleAuth}>
            {isRegisterMode ? "Register" : "Login"}
          </button>
          <br />
          <small>
            {isRegisterMode ? "Already have an account?" : "New user?"}{" "}
            <button onClick={() => setIsRegisterMode(!isRegisterMode)}>
              {isRegisterMode ? "Login here" : "Register here"}
            </button>
          </small>
          <br />
          {error && <p style={{ color: "red" }}>{error}</p>}
        </>
      ) : (
        <>
          <h2>Welcome, {user.username}</h2>
          <p>Wallets:</p>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li>BTC: {user.wallets.BTC.toFixed(4)}</li>
            <li>ETH: {user.wallets.ETH.toFixed(4)}</li>
          </ul>

          <h3> Multiplier: {Number(multiplier).toFixed(2)}x</h3>
          <h3>{crashed ? "Crashed!" : "Live"}</h3>

          <div>
            <h4> Place Bet</h4>
            <label>
              Amount (USD):
              <input
                type="number"
                value={usdAmount}
                onChange={(e) => setUsdAmount(e.target.value)}
              />
            </label>
            <br />
            <label>
              Currency:
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </select>
            </label>
            <br />
            <button onClick={handlePlaceBet}>Place Bet</button>
          </div>

          <div style={{ marginTop: "30px" }}>
            <h4> Withdraw</h4>
            <label>
              Amount ({currency}):
              <input
                type="number"
                value={withdrawAmountValue}
                onChange={(e) => setWithdrawAmountValue(e.target.value)}
              />
            </label>
            <br />
            <button onClick={handleWithdraw}>Withdraw</button>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </>
      )}
    </div>
  );
}

export default App;
