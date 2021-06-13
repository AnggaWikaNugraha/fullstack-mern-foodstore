import * as React from "react";
import TopBar from "../../component/Topbar";
import FaCartPlus from "@meronex/icons/fa/FaCartPlus";
import FaAddressCard from "@meronex/icons/fa/FaAddressCard";
import FaInfoCircle from "@meronex/icons/fa/FaInfoCircle";
import FaArrowRight from "@meronex/icons/fa/FaArrowRight";

import { sumPrice } from "../../utils/sum-price";
import { formatRupiah } from "../../utils/format-rupiah";
import { config } from "../../config";
import { useSelector } from "react-redux";
import { LayoutOne, Text, Steps, Table, Button } from "upkit";

const IconWrapper = ({ children }) => {
  return <div className="text-3xl flex justify-center">{children}</div>;
};

const steps = [
  {
    label: "Item",
    icon: (
      <IconWrapper>
        <FaCartPlus />
      </IconWrapper>
    ),
  },
  {
    label: "Alamat",
    icon: (
      <IconWrapper>
        <FaAddressCard />
      </IconWrapper>
    ),
  },
  {
    label: "Konfirmasi",
    icon: (
      <IconWrapper>
        <FaInfoCircle />
      </IconWrapper>
    ),
  },
];

const columns = [
  {
    Header: "Nama produk",
    accessor: (item) => (
      <div className="flex items-center">
        <img
          src={`${config.api_host}/upload/${item.image_url}`}
          width={48}
          alt={item.name}
        />
        {item.name}
      </div>
    ),
  },
  {
    Header: "Jumlah",
    accessor: "qty",
  },
  {
    Header: "Harga satuan",
    id: "price",
    accessor: (item) => <span> @ {formatRupiah(item.price)} </span>,
  },
  {
    Header: "Harga total",
    id: "subtotal",
    accessor: (item) => {
      return <div>{formatRupiah(item.price * item.qty)}</div>;
    },
  },
];

export default function Checkout() {
  let [activeStep, setActiveStep] = React.useState(0);

  let cart = useSelector((state) => state.cart);

  return (
    <LayoutOne>
      <TopBar />
      <Text as="h3"> Checkout </Text>
      <Steps steps={steps} active={activeStep}></Steps>
      {activeStep === 0 ? (
        <div>
          <br /> <br />
          <Table
            items={cart}
            columns={columns}
            perPage={cart.length}
            showPagination={false}
          />
          <div className="text-right">
            <Text as="h4">Subtotal: {formatRupiah(sumPrice(cart))}</Text>
          </div>
          <Button
            onClick={(_) => setActiveStep(activeStep + 1)}
            color="red"
            iconAfter={<FaArrowRight />}
          >
            {" "}
            Selanjutnya{" "}
          </Button>
        </div>
      ) : null}
    </LayoutOne>
  );
}
