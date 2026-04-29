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
import AdminDashboard from '../components/AdminDashboard.jsx';
import EmployeeDashboard from './orizzonte-employee-dashboard.jsx';
import { OrderProvider } from './context/OrderContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import ScrollToTop from '../components/ScrollToTop.jsx';

import './App.css';


function App() {
  return (
    <AuthProvider>
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
        <ProtectedRoute>
        <div>
          <NewOrder1 />
          <Footer />
        </div>
        </ProtectedRoute>
      } />
      <Route path='/commercial_merchandise' element={
        <ProtectedRoute>
        <div>
          <CommercialMerchandise />
          <Footer />
        </div>
        </ProtectedRoute>
      } />

      <Route path='/towing' element={
        <ProtectedRoute>
        <div>
          <Towing />
          <Footer />
        </div>
        </ProtectedRoute>
      } />

      <Route path='/water' element={
        <ProtectedRoute>
        <div>
          <Water />
          <Footer />
        </div>
        </ProtectedRoute>
      } />

      <Route path='/construction-materials' element={
        <ProtectedRoute>
        <div>
          <ConstructionMaterials />
          <Footer />
        </div>
        </ProtectedRoute>
      } />

      <Route path='/carbon-chemicals' element={
        <ProtectedRoute>
        <div>
          <CarbonChemicals />
          <Footer />
        </div>
        </ProtectedRoute>
      } />

      <Route path='/appliances' element={
        <ProtectedRoute>
        <div>
          <Appliances />
          <Footer />
        </div>
        </ProtectedRoute>
      } />

      <Route path='/map' element={
        <ProtectedRoute>
        <div>
          <MAP />
          <Footer />
        </div>
        </ProtectedRoute>
      } />

      <Route path='/time' element={
        <ProtectedRoute>
        <div>
          <TIME />
          <Footer />
        </div>
        </ProtectedRoute>
      } />

      <Route path='/sendorder' element={
        <ProtectedRoute>
        <div>
          <SendOrder />
          <Footer />
        </div>
        </ProtectedRoute>
      } />

      <Route path='/housemoving' element={
        <ProtectedRoute>
        <div>
          <HouseMoving />
          <Footer />
        </div>
        </ProtectedRoute>
      } />
      <Route path='/heavy-equipment' element={
        <ProtectedRoute>
        <div>
          <HeavyEquipment />
          <Footer />
        </div>
        </ProtectedRoute>
      } />
      <Route path='/order-summary' element={
        <ProtectedRoute>
        <div>
          <OrderSummary />
          <Footer />
        </div>
        </ProtectedRoute>
      } />
      <Route path='/order-confirmation' element={
        <ProtectedRoute>
        <div>
          <OrderConfirmation />
        </div>
        </ProtectedRoute>
      } />

        <Route path='/admin' element={
        <ProtectedRoute requiredRole="boss">
        <div>
          <AdminDashboard />
          <Footer />
        </div>
        </ProtectedRoute>
      } />

      <Route path='/employee-dashboard' element={
        <ProtectedRoute requiredRole="employee">
          <EmployeeDashboard />
        </ProtectedRoute>
      } />
    </Routes>
    </OrderProvider>
    </AuthProvider>
  );
}

export default App;