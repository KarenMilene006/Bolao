import { Routes, Route } from 'react-router-dom';

import { Login } from '../pages/Login';
import { Home } from '../pages/Home/Home';

export function AppRouts() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}
