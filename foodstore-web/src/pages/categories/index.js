import React from "react";
import * as Yup from "yup";
import DataTable from "react-data-table-component";

import { SideNav, LayoutSidebar } from "upkit";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, setCategory } from "../../features/products/actions";
import { useFormik } from "formik";
import { fetchItems } from "../../features/categories/action";
import styled from "styled-components";
import { NavLink } from "react-router-dom";

const menus = [
  { icon: '/images/menus/semua.png', label: 'Category', id: '' },
];

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
    {
      name: 'Actions',
      allowOverflow: true,
      cell: row => {
          return (
              <>
                <Button>Edit</Button>
                <Button Bg={'#bababa'}>delete</Button>
              </>
          )
      }
  }
  ];

  return (
    <div>
      <LayoutSidebar
        sidebar={
          <WrapSidebar>
            <BtnNav>
              <NavLink to={'/admin/categories'}>Categories</NavLink>
            </BtnNav>
            <NavLink to={'/admin/product'}>product</NavLink>
          </WrapSidebar>
        }
        content={
          <div className="w-full p-10 mr-5 h-full min-h-screen">
            <div>
              <Heading>CATEGORY</Heading>
              <Button>Tambah</Button>
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

const Heading = styled('p')((props)=> ({
  fontSize : '23px',
  marginBottom : '30px'
}))

const Button = styled('button')((props)=> ({
  backgroundColor : props.Bg ? props.Bg : 'black',
  color: props.CFont ? props.CFont : 'white',
  padding: "10px 20px",
  marginRight : '20px',
  borderRadius : '5px'
}))

const WrapSidebar = styled('div')((props) => ({
  display: 'flex',
  flexDirection : "column"
}))

const BtnNav  = styled('button')((props)=> ({
  backgroundColor : props.Bg ? props.Bg : 'black',
  color: props.CFont ? props.CFont : 'white',
  marginRight : '20px',
  borderRadius : '5px',
}))