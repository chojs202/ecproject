import "./LoadingPage.css";
import logo from '../Assets/shop_image.png';
import { motion } from "framer-motion";

const LoadingPage = ({ progress }) => {
  return (
    <motion.div
      className="loading-overlay"
      
      exit={{ opacity: 0, scale: 1.02 }}      // 사라질 때 부드럽게
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        className="loading-logo-wrap"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <img src={logo} alt="SHOP logo" className="loading-logo" />
        <span className="loading-text">MODERN ONLINE STORE</span>
          {/* 🔥 진행률 바 */}
        <div className="loading-progress">
          <div
            className="loading-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoadingPage;