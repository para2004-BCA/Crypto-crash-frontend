import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('https://crypto-crash-game-zohl.onrender.com');

const Game = ({ playerId }) => {
  const [multiplier, setMultiplier] = useState(1.0);
  const [status, setStatus] = useState('Waiting...');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('BTC');
  const [message, setMessage] = useState('');

  useEffect(() => {
    socket.on('multiplier', (m) => setMultiplier(m.toFixed(2)));
    socket.on('status', (msg) => setStatus(msg));
    socket.on('crash', (val) => setMessage(`💥 Crashed at ${val.toFixed(2)}x`));
    return () => socket.disconnect();
  }, []);

  const placeBet = async () => {
    try {
      const res = await axios.post('https://crypto-crash-game-zohl.onrender.com/api/game/bet', {
        playerId,
        usdAmount: parseFloat(amount),
        currency
      });
      setMessage(`✅ Bet placed! ${res.data.cryptoAmount.toFixed(6)} ${currency}`);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.error || 'Bet failed'}`);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '3rem', color: '#00ffae' }}>{multiplier}x</h2>
      <p>{status}</p>
      <input
        type="number"
        placeholder="USD Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      /><br />
      <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
        <option value="BTC">BTC</option>
        <option value="ETH">ETH</option>
      </select><br />
      <button onClick={placeBet} style={{ marginTop: '1rem' }}>Place Bet</button>
      <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{message}</p>
    </div>
  );
};

export default Game;
