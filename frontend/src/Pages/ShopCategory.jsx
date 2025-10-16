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

  // query 값 미리 변수로 추출 (ESLint 경고 해결)
  const pageValue = query.get('page');
  const sortValue = query.get('sort');

  // state 초기화
  const [currentPage, setCurrentPage] = useState(parseInt(pageValue) || 1);
  const [sortOption, setSortOption] = useState(sortValue || 'new');
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // 반응형 itemsPerPage
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 500) setItemsPerPage(8);
      else if (window.innerWidth <= 800) setItemsPerPage(9);
      else setItemsPerPage(8);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // URL 변화 → state 동기화 (변수를 dependency로)
  useEffect(() => {
    setCurrentPage(parseInt(pageValue) || 1);
    setSortOption(sortValue || 'new');
  }, [pageValue, sortValue]);

  // 카테고리 필터
  const filteredProducts = all_product.filter(
    (item) => item.category === props.category
  );

  // date 문자열 → 숫자
  const getDateValue = (d) => new Date(d).getTime();

  // 정렬 로직
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

  // 페이지네이션
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  // 페이지 이동
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    navigate(`?page=${page}&sort=${sortOption}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 정렬 변경
  const handleSortChange = (newSort) => {
    setSortOption(newSort);
    setCurrentPage(1); // 정렬 바꾸면 페이지 1로 초기화
    navigate(`?page=1&sort=${newSort}`);
  };

  return (
    <div className='shop-category'>
      <motion.img
       className="shopcategory-banner"
       src={props.banner}
       alt=""
       initial={{ opacity: 0, y: 30, scale: 0.98 }}
       animate={{ opacity: 1, y: 0, scale: 1 }}
       transition={{ duration: 0.8, ease: "easeOut" }}
       viewport={{ once: false, amount: 0.8 }}
      />

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

      <div className='shopcategory-products'>
        {currentItems.map((item) => (
          <Item
            key={item.id}
            id={item.id}
            name={item.name}
            image={item.image}
            size={item.size}
            new_price={item.new_price}
            old_price={item.old_price}
            date={item.date}
          />
        ))}
      </div>

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
