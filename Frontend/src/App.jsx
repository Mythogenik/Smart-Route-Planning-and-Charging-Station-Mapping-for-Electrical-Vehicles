import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages';
import { Login }   from './pages';
import { Signup }  from './pages';
import Dashboard   from './pages/Dashboard/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Landing />}   />
        <Route path="/login"     element={<Login />}     />
        <Route path="/signup"    element={<Signup />}    />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}