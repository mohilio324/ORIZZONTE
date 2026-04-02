import { Routes, Route } from 'react-router-dom';


import Header from '../components/Header.jsx';
import Hero from '../components/Hero.jsx';
import Services from '../components/Services.jsx';
import WhyOrizzonte from '../components/WhyOrizzonte.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import Footer from '../components/Footer.jsx';
import Login from '../components/Login.jsx';
import SignIn from '../components/SignIn.jsx';
import NewOrder1 from '../components/NewOrder1.jsx';
import './App.css';

function App() {
  return (


    <Routes>
      <Route path='/' element ={
      <div>
      <Header />
      <Hero />
      <Services />
      <WhyOrizzonte />
      <HowItWorks />
      <Footer />
      </div>
     

      }/>

      <Route path="/SignIn" element={<SignIn />}  />

      <Route path="/login" element={<Login />}/>

      <Route path='/NewOrder1' element={
        <div>
          <NewOrder1 />
          <Footer />
        </div>
      }/>
      </Routes>
   
  );
}

export default App;