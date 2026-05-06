import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages';
import { Login }   from './pages';
import { Signup }  from './pages';
import Dashboard   from './pages/Dashboard/Dashboard';
import CreateRoute from './pages/CreateRoute/CreateRoute';
import AddVehicle  from './pages/AddVehicle/AddVehicle';
import Stations    from './pages/Stations/Stations';
import ViewRoute   from './pages/ViewRoute/ViewRoute';
import Payment     from './pages/payment/Payment';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"              element={<Landing />}     />
        <Route path="/login"         element={<Login />}       />
        <Route path="/signup"        element={<Signup />}      />
        <Route path="/dashboard"     element={<Dashboard />}   />
        <Route path="/create-route"  element={<CreateRoute />} />
        <Route path="/add-vehicle"   element={<AddVehicle />}  />
        <Route path="/stations"      element={<Stations />}    />
        <Route path="/route/:id"     element={<ViewRoute />}   />
        <Route path="/payment"       element={<Payment />}     />
      </Routes>
    </BrowserRouter>
  );
}