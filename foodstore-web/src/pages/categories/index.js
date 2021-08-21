import React from "react";
import menus from "../menu";
import * as Yup from "yup";
import DataTable from "react-data-table-component";

import { useHistory } from "react-router-dom";
import { SideNav, LayoutSidebar } from "upkit";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, setCategory } from "../../features/products/actions";
import { useFormik } from "formik";
import { fetchItems } from "../../features/categories/action";

const Home = () => {
  let dispatch = useDispatch();
  let state = useSelector((items) => items.category);

  React.useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      name: "",
    },

    validationSchema: Yup.object({
      name: Yup.string()
        .min(3, "Must be more 3 characters")
        .max(20, "Must be 15 characters or less")
        .required("Required"),
    }),

    onSubmit: (values) => {
      alert(JSON.stringify(values));
    },
  });

  // const columns = state.data.map((item, index) => {
  //   const obj = {
  //     name: "title",
  //     selector: "title",
  //     sortable: true,
  //   };

  //   return obj;
  // });

  const columns = [
    {
      name: "Name category",
      selector: "name",
      sortable: true,
    },
  ];

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
          <div className="w-full p-10 mr-5 h-full min-h-screen">
            <div className="container__category">
              <h3 className="category__heading">CATEGORY</h3>

              <DataTable columns={columns} data={state.data} />

              {/* <form onSubmit={formik.handleSubmit}>
                <div className="form__container">
                  <label htmlFor="name">Name</label>
                  <input
                    className="input__styles"
                    id="name"
                    type="text"
                    {...formik.getFieldProps("name")}
                  />
                  {formik.touched.name && formik.errors.name ? (
                    <div className="container__error">{formik.errors.name}</div>
                  ) : null}
                </div>

                <button className="btn__submit" type="submit">
                  Submit
                </button>
              </form> */}
            </div>
          </div>
        }
        sidebarSize={80}
      />
    </div>
  );
};

export default Home;
