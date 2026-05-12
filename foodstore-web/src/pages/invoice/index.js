import * as React from "react";
import { useRouteMatch } from "react-router-dom";
import { getInvoiceByOrderId } from "../../api/invoice";
import { LayoutSidebar, Text, Table } from "upkit";
import TopBar from "../../component/Topbar";
import AppSidebar from "../../component/AppSidebar";
import BounceLoader from "react-spinners/BounceLoader";
import { formatRupiah } from "../../utils/format-rupiah";
import { config } from "../../config";
import StatusLabel from "../../component/StatusLabel";

export default function Invoice() {
  let [invoice, setInvoice] = React.useState(null);
  let [error, setError] = React.useState("");
  let [status, setStatus] = React.useState("process");

  let { params } = useRouteMatch();

  React.useEffect(() => {
    getInvoiceByOrderId(params?.order_id)
      .then(({ data }) => {
        if (data?.error) {
          setError(data.message || "Terjadi kesalahan yang tidak diketahui");
        }
        setInvoice(data);
      })
      .finally(() => setStatus("idle"));
  }, [params]);

  const renderContent = () => {
    if (error.length) {
      return (
        <div className="p-10">
          <TopBar />
          <Text as="h3">Terjadi Kesalahan</Text>
          <p>{error}</p>
        </div>
      );
    }

    if (status === "process") {
      return (
        <div className="flex justify-center py-20">
          <BounceLoader color="red" />
        </div>
      );
    }

    if (!invoice) {
      return (
        <div style={{ textAlign: 'center', padding: '64px 24px', color: '#aaa' }}>
          <TopBar />
          <div style={{ fontSize: 52, marginBottom: 12 }}>🧾</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#bbb', margin: 0 }}>Invoice tidak ditemukan</p>
          <p style={{ fontSize: 13, color: '#ccc', marginTop: 6 }}>Order mungkin belum diproses atau ID tidak valid</p>
        </div>
      );
    }

    return (
      <div className="p-10">
        <TopBar />
        <Text as="h3"> Invoice </Text>
        <br />
        <Table
          showPagination={false}
          items={[
            { label: "Status", value: <StatusLabel status={invoice?.payment_status} /> },
            { label: "Order ID", value: "#" + invoice?.order?.order_number },
            { label: "Total amount", value: formatRupiah(invoice?.total) },
            {
              label: "Billed to",
              value: (
                <div>
                  <b>{invoice?.user?.full_name}</b> <br />
                  {invoice?.user?.email} <br /><br />
                  {invoice?.delivery_address?.detail} <br />
                  {invoice?.delivery_address?.kelurahan}, {invoice?.delivery_address?.kecamatan} <br />
                  {invoice?.delivery_address?.kabupaten} <br />
                  {invoice?.delivery_address?.provinsi}
                </div>
              ),
            },
            {
              label: "Payment to",
              value: (
                <div>
                  {config.owner} <br />
                  {config.contact} <br />
                  {config.billing.account_no} <br />
                  {config.billing.bank_name}
                </div>
              ),
            },
          ]}
          columns={[
            { Header: "Invoice", accessor: "label" },
            { Header: "", accessor: "value" },
          ]}
        />
      </div>
    );
  };

  return (
    <LayoutSidebar
      sidebar={<AppSidebar />}
      sidebarSize={80}
      content={<div className="min-h-screen">{renderContent()}</div>}
    />
  );
}
