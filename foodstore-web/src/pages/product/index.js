import React from "react";
import menus from "../menu";

import { useHistory } from "react-router-dom";
import { SideNav, LayoutSidebar } from "upkit";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, setCategory } from "../../features/products/actions";

const Home = () => {
  let dispatch = useDispatch();

  let history = useHistory();

  let products = useSelector((state) => state.products);
  let cart = useSelector((state) => state.cart);

  React.useEffect(() => {
    dispatch(fetchProducts());
  }, [
    dispatch,
    products.currentPage,
    products.keyword,
    products.category,
    products.tags,
  ]);

  return (
    <div>
      <LayoutSidebar
        sidebar={
          <SideNav
            items={menus}
            verticalAlign="top"
            onChange={(category) => dispatch(setCategory(category))}
          />
        }
        content={
          <div className="md:flex w-full mr-5 h-full min-h-screen">
            <div>Add products</div>
          </div>
        }
        sidebarSize={80}
      />
    </div>
  );
};

export default Home;
