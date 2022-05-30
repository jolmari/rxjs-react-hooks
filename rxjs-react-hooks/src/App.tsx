import { NumberGenerator } from './NumberGenerator';
import './App.css';
import { Dictionary } from './Dictionary';

function App() {

  return (
    <div className="App">
      <div className="numbers-container">
        <NumberGenerator />
      </div>
      <hr />
      <div className="duck-container">
        <Dictionary />
      </div>
    </div>
  );
}

export default App;
