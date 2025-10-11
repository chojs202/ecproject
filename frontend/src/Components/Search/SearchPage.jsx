import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Item from "../Item/Item";
import "./SearchPage.css"; 
import { API } from "../../config";


export const SearchPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState("new");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 500) setItemsPerPage(8);
      else if (window.innerWidth <= 800) setItemsPerPage(9);
      else setItemsPerPage(8);
    };

    handleResize(); // 초기 실행
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API}/search?q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        if (data.success) setResults(data.products || []);
        else setResults([]);
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
    setCurrentPage(1); // 검색 시 페이지 초기화
  }, [query]);

  // 정렬
  const sortedResults = (() => {
    const getDateValue = (d) => new Date(d).getTime();
    if (sortOption === "old")
      return [...results].sort((a, b) => getDateValue(a.date) - getDateValue(b.date));
    else if (sortOption === "low")
      return [...results].sort((a, b) => a.new_price - b.new_price || getDateValue(b.date) - getDateValue(a.date));
    else if (sortOption === "high")
      return [...results].sort((a, b) => b.new_price - a.new_price || getDateValue(b.date) - getDateValue(a.date));
    else
      return [...results].sort((a, b) => getDateValue(b.date) - getDateValue(a.date));
  })();

  // 페이지네이션
  const totalPages = Math.ceil(sortedResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = sortedResults.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="shop-category">
      {/* 배너 */}
      <h1 className="shopcategory-banner">
        {query ? `Search Results for "${query}"` : "Please enter a search term"}
      </h1>

      {/* 검색어 없을 때 */}
      {!query && <p className="search-message">Type a product name in the search bar to start</p>}

      {/* 로딩 */}
      {loading && <p className="search-message">Loading...</p>}

      {/* 검색 결과 */}
      {!loading && query && results.length === 0 && (
        <p className="search-message">No products found for "{query}"</p>
      )}

      {/* 정렬 옵션 */}
      {results.length > 0 && (
        <div className="shopcategory-indexSort">
          <p>
            <span>
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, results.length)}
            </span>{" "}
            out of {results.length} products
          </p>

          <select
            className="shopcategory-sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="new">New Arrivals</option>
            <option value="old">Oldest</option>
            <option value="high">Highest Price</option>
            <option value="low">Lowest Price</option>
          </select>
        </div>
      )}

      {/* 상품 리스트 */}
      <div className="shopcategory-products">
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
            className="item"
          />
        ))}
      </div>

      {/* 페이지네이션 */}
      {results.length > itemsPerPage && (
        <div className="shopcategory-pagination">
          <button
            className="pagination-btn"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`pagination-btn ${currentPage === i + 1 ? "active" : ""}`}
              onClick={() => goToPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="pagination-btn"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
