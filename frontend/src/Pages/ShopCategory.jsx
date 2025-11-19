import { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CSS/ShopCategory.css';
import { ShopContext } from '../Context/ShopContext';
import Item from '../Components/Item/Item';
import { motion } from "framer-motion";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const ShopCategory = (props) => {
  const { all_product } = useContext(ShopContext);
  const query = useQuery();
  const navigate = useNavigate();

  const pageValue = query.get('page');
  const sortValue = query.get('sort');

  const [currentPage, setCurrentPage] = useState(parseInt(pageValue) || 1);
  const [sortOption, setSortOption] = useState(sortValue || 'new');
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useEffect(() => {
    const preload = new Image();
    preload.src = props.banner;
  }, [props.banner]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 500) setItemsPerPage(6);
      else if (window.innerWidth <= 800) setItemsPerPage(8);
      else setItemsPerPage(8);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setCurrentPage(parseInt(pageValue) || 1);
    setSortOption(sortValue || 'new');
  }, [pageValue, sortValue]);

  const filteredProducts = all_product.filter(
    (item) => item.category === props.category
  );

  const getDateValue = (d) => new Date(d).getTime();

  const sortedProducts = (() => {
    if (sortOption === 'old') {
      return [...filteredProducts].sort(
        (a, b) => getDateValue(a.date) - getDateValue(b.date)
      );
    } else if (sortOption === 'low') {
      return [...filteredProducts].sort((a, b) => {
        if (a.new_price === b.new_price) return getDateValue(b.date) - getDateValue(a.date);
        return a.new_price - b.new_price;
      });
    } else if (sortOption === 'high') {
      return [...filteredProducts].sort((a, b) => {
        if (a.new_price === b.new_price) return getDateValue(b.date) - getDateValue(a.date);
        return b.new_price - a.new_price;
      });
    } else {
      return [...filteredProducts].sort(
        (a, b) => getDateValue(b.date) - getDateValue(a.date)
      );
    }
  })();

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    navigate(`?page=${page}&sort=${sortOption}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSort) => {
    setSortOption(newSort);
    setCurrentPage(1);
    navigate(`?page=1&sort=${newSort}`);
     window.location.reload();
  };

  return (
    <div className='shop-category'>
      {/* ✅ 배너 */}
      <motion.img
        className={`shopcategory-banner ${bannerLoaded ? 'visible' : ''}`}
        src={props.banner}
        alt=''
        onLoad={() => setBannerLoaded(true)}
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={bannerLoaded ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* ✅ 상단 정렬 영역 */}
      <div className='shopcategory-indexSort'>
        <p>
          <span>
            Showing {sortedProducts.length === 0 ? 0 : startIndex + 1}-
            {Math.min(startIndex + itemsPerPage, sortedProducts.length)}
          </span>{' '}
          out of {sortedProducts.length} products
        </p>

        <select
          className='shopcategory-sort'
          value={sortOption}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          <option value='new'>New Arrivals</option>
          <option value='old'>Oldest</option>
          <option value='high'>Highest Price</option>
          <option value='low'>Lowest Price</option>
        </select>
      </div>

      {/* ✅ 상품 리스트 */}
      <motion.div
        className='shopcategory-products'
        layout
      >
        {currentItems.map((item, index) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.05, // 같은 페이지 안에서만 살짝 순차 등장
              ease: "easeOut",
            }}
          >
            <Item
              id={item.id}
              name={item.name}
              image={item.image}
              size={item.size}
              new_price={item.new_price}
              old_price={item.old_price}
              date={item.date}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* ✅ 페이지네이션 */}
      <div className='shopcategory-pagination'>
        <button
          className='pagination-btn'
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          type='button'
        >
          &lt;
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
            onClick={() => goToPage(i + 1)}
            type='button'
          >
            {i + 1}
          </button>
        ))}

        <button
          className='pagination-btn'
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          type='button'
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default ShopCategory;
