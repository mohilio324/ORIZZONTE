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
import CommercialMerchandise from '../components/commercial_merchandise.jsx';
import Towing from '../components/towing.jsx';
import Water from '../components/water.jsx';
import ConstructionMaterials from '../components/construction-materials.jsx';
import Appliances from '../components/appliances.jsx';
import CarbonChemicals from '../components/carbon-chemicals.jsx';
import MAP from '../components/MAP.jsx';
import TIME from '../components/order-time-date.jsx';
import SendOrder from '../components/SendOrder.jsx';
import HouseMoving from '../components/housemoving.jsx';
import HeavyEquipment from '../components/HeavyEquipment.jsx';
import OrderSummary from '../components/OrderSummary.jsx';
import OrderConfirmation from '../components/OrderConfirmation.jsx';
import { OrderProvider } from './context/OrderContext.jsx';
import ScrollToTop from '../components/ScrollToTop.jsx';


import './App.css';


function App() {
  return (
    <OrderProvider>
      <ScrollToTop />
      <Routes>
      <Route path='/' element={
        <div>
          <Header />
          <Hero />
          <Services />
          <WhyOrizzonte />
          <HowItWorks />
          <Footer />
        </div>


      } />

      <Route path="/SignIn" element={<SignIn />} />

      <Route path="/login" element={<Login />} />

      <Route path='/NewOrder1' element={
        <div>
          <NewOrder1 />
          <Footer />
        </div>
      } />
      <Route path='/commercial_merchandise' element={
        <div>
          <CommercialMerchandise />
          <Footer />
        </div>
      } />

      <Route path='/towing' element={
        <div>
          <Towing />
          <Footer />
        </div>
      } />

      <Route path='/water' element={
        <div>
          <Water />
          <Footer />
        </div>
      } />

      <Route path='/construction-materials' element={
        <div>
          <ConstructionMaterials />
          <Footer />
        </div>
      } />

      <Route path='/carbon-chemicals' element={
        <div>
          <CarbonChemicals />
          <Footer />
        </div>
      } />

      <Route path='/appliances' element={
        <div>
          <Appliances />
          <Footer />
        </div>
      } />

      <Route path='/map' element={
        <div>
          <MAP />
          <Footer />
        </div>
      } />

      <Route path='/time' element={
        <div>
          <TIME />
          <Footer />
        </div>
      } />

      <Route path='/sendorder' element={
        <div>
          <SendOrder />
          <Footer />
        </div>
      } />

      <Route path='/housemoving' element={
        <div>
          <HouseMoving />
          <Footer />
        </div>
      } />
      <Route path='/heavy-equipment' element={
        <div>
          <HeavyEquipment />
          <Footer />
        </div>
      } />
      <Route path='/order-summary' element={
        <div>
          <OrderSummary />
          <Footer />
        </div>
      } />
      <Route path='/order-confirmation' element={
        <div>
          <OrderConfirmation />
        </div>
      } />
    </Routes>
    </OrderProvider>
  );
}

export default App;