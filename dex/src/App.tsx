import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Routes, Route } from "react-router-dom";
import Swap from "./components/Swap";
import Tokens from "./components/Tokens";
import toast, { Toaster } from "react-hot-toast";

//Typescript is overkill for a project of this size, but i used it purely for practice and habit

function App() {
  return (
    <div className='App'>
      <Toaster
        toastOptions={{
          style: {
            borderRadius: "10px",
            background: "#0e111b",
            color: "#fff",
          },
        }}
      />
      <Header />
      <div className='mainWindow'>
        <Routes>
          <Route path='/' element={<Swap toast={toast} />} />
          <Route path='/tokens' element={<Tokens />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
