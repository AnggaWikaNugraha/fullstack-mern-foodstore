import * as React from "react";
import TopBar from "../../component/Topbar";
import FaArrowLeft from "@meronex/icons/fa/FaArrowLeft";

import { LayoutOne, Text, Table, Button } from "upkit";
import { Link, useLocation } from "react-router-dom";
import { useAddressData } from "../../hooks/address";

const columns = [
  { Header: "Nama", accessor: "nama" },
  {
    Header: "Detail",
    accessor: (alamat) => {
      return (
        <div>
          {alamat.provinsi}, {alamat.kabupaten}, {alamat.kecamatan},{" "}
          {alamat.kelurahan} <br />
          {alamat.detail}
        </div>
      );
    },
  },
];

export default function UserAddress() {
  let location = useLocation();
  let searchParams = new URLSearchParams(location.search);
  let isFromCheckout = searchParams.get("from") === "checkout";
  let { data, limit, page, status, count, setPage } = useAddressData();

  return (
    <LayoutOne size="large">
      <div>
        <TopBar />
        <Text as="h3"> Alamat pengiriman </Text>
        <br />

        <div>
          {isFromCheckout ? (
            <div className="mb-4">
              <Link to="/checkout?step=2">
                <Button color="gray" iconBefore={<FaArrowLeft />}>
                  Kembali ke step 2
                </Button>
              </Link>
              <br />
              <br />
            </div>
          ) : null}
          <Link
            to={
              isFromCheckout
                ? "/alamat-pengiriman/tambah?from=checkout&step=2"
                : "/alamat-pengiriman/tambah"
            }
          >
            <Button>Tambah baru</Button>
          </Link>
          <br />
          <br />

          <Table
            items={data}
            columns={columns}
            totalItems={count}
            page={page}
            perPage={limit}
            isLoading={status === "process"}
            onPageChange={(page) => setPage(page)}
          />
        </div>

        {status === "success" && !data.length ? (
          <div className="text-center p-10">
            Kamu belum menambahkan alamat pengiriman. <br />
            <Link
              to={
                isFromCheckout
                  ? "/alamat-pengiriman/tambah?from=checkout&step=2"
                  : "/alamat-pengiriman/tambah"
              }
            >
              <Button> Tambah Baru </Button>
            </Link>
          </div>
        ) : null}
      </div>
    </LayoutOne>
  );
}
