import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import Routing from "./routes/Routing";
import ErrorBoundary from "./components/common/ErrorBoundary";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
      <AuthProvider>
        <ErrorBoundary>
          <Routing />
        </ErrorBoundary>
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </div>
  );
}

export default App;
