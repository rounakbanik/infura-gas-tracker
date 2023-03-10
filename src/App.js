import './App.css';
import axios from 'axios';
import { useState } from 'react';
import { useInterval } from './hooks/useInterval';

// Infura URl
const baseUrl = "https://mainnet.infura.io/v3/fbd1cd3ce9494434ac35c07bac0e4e74";

// Data and configuration required to make the API request
let data = JSON.stringify({
  "jsonrpc": "2.0",
  "method": "eth_feeHistory",
  "params": [
    "0x5",
    "latest",
    []
  ],
  "id": 1
});

let config = {
  method: 'post',
  url: baseUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  data: data
};

function App() {

  // Variable that holds history of the last 5 blocks
  const [feeHistory, setFeeHistory] = useState(null);

  // useInterval is like useEffect, except that it is called after a certain interval 
  // In our case, this is 15 seconds
  useInterval(() => {

    const getFeeHistory = async () => {

      // Extract fee history
      const response = await axios(config);
      let history = response['data']['result'];

      // Convert base fee to Gwei
      history['baseFeePerGas'] = history['baseFeePerGas'].map(x => (parseInt(x) / 10 ** 9).toFixed(2));

      // Convert block to decimal
      history['oldestBlock'] = parseInt(history['oldestBlock'])

      // Truncate decimals of gas used and convert to percentage
      history['gasUsedRatio'] = history['gasUsedRatio'].map(x => (x * 100).toFixed(2))

      // Get block range
      let blockRange = []
      for (let i = 0; i < 5; i++) blockRange.push(history['oldestBlock'] + i);

      // Create a 2D array consisting of all the information received from the API
      let formattedHistory = [
        blockRange,
        history['baseFeePerGas'].slice(0, 5),
        history['gasUsedRatio']
      ];

      // Transpose the array
      // This is done so we can populate HTML tables more easily
      const transpose = m => m[0].map((x, i) => m.map(x => x[i]))
      formattedHistory = transpose(formattedHistory);

      setFeeHistory(formattedHistory);
      console.log(formattedHistory);
    }

    // Call function every 15 seconds
    getFeeHistory();

  }, 1000 * 15)

  return (
    <div className="App">
      <h1>Ethereum Gas Tracker</h1>
      {feeHistory && <table>
        <thead>
          <tr>
            <th>Block Number</th>
            <th>Base Fee (in Gwei)</th>
            <th>Gas Used</th>
          </tr>
        </thead>
        <tbody>
          {feeHistory.map(row => {
            return (
              <tr key={row[0]}>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
                <td>{row[2]}%</td>
              </tr>
            )
          })}
        </tbody>
      </table>}
    </div>
  );
}

export default App;
