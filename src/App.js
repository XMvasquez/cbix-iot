import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Luces from './components/luces'
import LuzEditComponent from './components/luzEditComponent'

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/luces" element={<Luces />} />
          <Route path="/luces/edit/:id" element={<LuzEditComponent />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
