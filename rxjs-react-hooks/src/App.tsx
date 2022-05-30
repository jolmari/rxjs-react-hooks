import logo from './logo.svg';
import './App.css';

import { from } from 'rxjs';
import { map } from 'rxjs/operators';

const numbers$ = from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

const squared$ = numbers$.pipe(
  map(x => x * x)
)

const cubed$ = numbers$.pipe(
  map(x => x * x * x)
)

squared$.subscribe(x => console.log(`Squared ${x}`));
cubed$.subscribe(x => console.log(`Cubed ${x}`));

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
