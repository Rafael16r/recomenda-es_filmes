import React from "react";
import "./CategoryFilter.css";

function CategoryFilter({ categories, selectedCategory, onSelect }) {
  return (
    <div className="category-filter">
      {categories.map((cat) => (
        <button
          key={cat.label}
          className={cat.label === selectedCategory.label ? "active" : ""}
          onClick={() => onSelect(cat)}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;
