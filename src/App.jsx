import React from 'react';
import { Routes, Route} from 'react-router-dom';
import Layout from './components/Layout';
import MainPage from './components/MainPage';
import Redirect from './components/Redirect';
import Login from './components/Login';
import Error404 from './errorpage/Error404';
import Error400 from './errorpage/Error400';
import Notes from './components/Notes';


function App() {
  return (
    <Layout>
      <Routes>
          <Route exact path="/" element={<MainPage />} />

          <Route exact path="/redirect" element={<Redirect />} />
          <Route exact path="/forceredirect" element={<Error400 />} />

          <Route exact path="/login" element={<Login />} />

          <Route exact path="/notes" element={<Notes />} />
          <Route exact path="/notes/*" element={<Notes />} />

          <Route path="*" element={<Error404 />} />
      </Routes>
    </Layout>
  );
}

export default App;
