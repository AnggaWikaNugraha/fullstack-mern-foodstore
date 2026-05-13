import * as React from "react";
import { useRouteMatch } from "react-router-dom";
import { getInvoiceByOrderId } from "../../api/invoice";
import { createReview, getMyOrderReviews } from "../../api/review";
import { LayoutSidebar, Text, Table } from "upkit";
import AppSidebar from "../../component/AppSidebar";
import StarRating from "../../component/StarRating";
import BounceLoader from "react-spinners/BounceLoader";
import { formatRupiah } from "../../utils/format-rupiah";
import { config } from "../../config";
import StatusLabel from "../../component/StatusLabel";
import styled from "@emotion/styled";

export default function Invoice() {
  let [invoice, setInvoice] = React.useState(null);
  let [error, setError] = React.useState("");
  let [status, setStatus] = React.useState("process");

  // State untuk modal rating
  let [ratingTarget, setRatingTarget] = React.useState(null); // { product_id, name }
  let [rating, setRating] = React.useState(0);
  let [comment, setComment] = React.useState("");
  let [submitting, setSubmitting] = React.useState(false);
  let [submitMsg, setSubmitMsg] = React.useState("");

  // Menyimpan product_id yang sudah dirating user di order ini
  let [reviewedIds, setReviewedIds] = React.useState([]);

  let { params } = useRouteMatch();

  React.useEffect(() => {
    getInvoiceByOrderId(params?.order_id)
      .then(({ data }) => {
        if (data?.error) {
          setError(data.message || "Terjadi kesalahan yang tidak diketahui");
        }
        setInvoice(data);
        // Setelah invoice dimuat, cek review yang sudah ditulis user di order ini
        return getMyOrderReviews(params?.order_id);
      })
      .then(({ data }) => {
        const ids = (data?.data || []).map(r => String(r.product?._id || r.product));
        setReviewedIds(ids);
      })
      .catch(() => {})
      .finally(() => setStatus("idle"));
  }, [params]);

  const openModal = (item) => {
    setRatingTarget({ product_id: String(item.product._id), name: item.name });
    setRating(0);
    setComment("");
    setSubmitMsg("");
  };

  const closeModal = () => {
    setRatingTarget(null);
    setSubmitting(false);
    setSubmitMsg("");
  };

  const handleSubmitReview = async () => {
    if (!rating) return setSubmitMsg("Pilih bintang dulu ya!");
    setSubmitting(true);
    try {
      const { data } = await createReview({
        product_id: ratingTarget.product_id,
        order_id: invoice.order._id,
        rating,
        comment,
      });
      if (data?.error) {
        setSubmitMsg(data.message);
      } else {
        setReviewedIds(prev => [...prev, ratingTarget.product_id]);
        closeModal();
      }
    } catch {
      setSubmitMsg("Gagal menyimpan rating, coba lagi.");
    }
    setSubmitting(false);
  };

  const renderContent = () => {
    if (error.length) {
      return (
        <div className="p-10">
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
          <div style={{ fontSize: 52, marginBottom: 12 }}>🧾</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#bbb', margin: 0 }}>Invoice tidak ditemukan</p>
          <p style={{ fontSize: 13, color: '#ccc', marginTop: 6 }}>Order mungkin belum diproses atau ID tidak valid</p>
        </div>
      );
    }

    const orderItems = invoice?.order?.order_items || [];

    return (
      <div className="p-10">
        <Text as="h3"> Invoice </Text>
        <br />

        {/* Tabel info pembayaran */}
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

        {/* Tabel produk yang dibeli + tombol rating */}
        {orderItems.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <Text as="h5">Produk yang dibeli</Text>
            <br />
            <ItemsTable>
              <thead>
                <tr>
                  <Th>Produk</Th>
                  <Th style={{ textAlign: 'center' }}>Qty</Th>
                  <Th style={{ textAlign: 'right' }}>Harga</Th>
                  <Th style={{ textAlign: 'center' }}>Rating</Th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item, i) => {
                  const pid = String(item.product?._id || item.product);
                  const alreadyReviewed = reviewedIds.includes(pid);
                  return (
                    <tr key={i}>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {item.product?.image_url && (
                            <img
                              src={`${config.api_host}/upload/${item.product.image_url}`}
                              alt={item.name}
                              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }}
                            />
                          )}
                          <span>{item.name}</span>
                        </div>
                      </Td>
                      <Td style={{ textAlign: 'center' }}>{item.qty}</Td>
                      <Td style={{ textAlign: 'right' }}>{formatRupiah(item.price)}</Td>
                      <Td style={{ textAlign: 'center' }}>
                        {alreadyReviewed ? (
                          <RatedBadge>✓ Sudah dinilai</RatedBadge>
                        ) : (
                          <RateBtn onClick={() => openModal(item)}>
                            ⭐ Beri Rating
                          </RateBtn>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </ItemsTable>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <LayoutSidebar
        sidebar={<AppSidebar />}
        sidebarSize={80}
        content={<div className="min-h-screen">{renderContent()}</div>}
      />

      {/* Modal rating */}
      {ratingTarget && (
        <Overlay onClick={closeModal}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalTitle>Beri Rating</ModalTitle>
            <ProductName>{ratingTarget.name}</ProductName>

            <div style={{ margin: '16px 0 8px' }}>
              <StarRating value={rating} onChange={setRating} size={36} />
            </div>
            <RatingHint>
              {rating === 0 && "Pilih bintang"}
              {rating === 1 && "Sangat buruk"}
              {rating === 2 && "Kurang memuaskan"}
              {rating === 3 && "Cukup baik"}
              {rating === 4 && "Bagus!"}
              {rating === 5 && "Sempurna! 🎉"}
            </RatingHint>

            <CommentBox
              placeholder="Tulis komentar (opsional)..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              maxLength={500}
            />

            {submitMsg && <ErrMsg>{submitMsg}</ErrMsg>}

            <ModalFooter>
              <SubmitBtn onClick={handleSubmitReview} disabled={submitting || !rating}>
                {submitting ? "Menyimpan..." : "Kirim Rating"}
              </SubmitBtn>
              <CancelBtn onClick={closeModal}>Batal</CancelBtn>
            </ModalFooter>
          </Modal>
        </Overlay>
      )}
    </>
  );
}

/* ─── Styled components ─── */

const ItemsTable = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 14,
});

const Th = styled('th')({
  padding: '10px 12px',
  borderBottom: '2px solid #f0f0f0',
  color: '#666',
  fontWeight: 600,
  textAlign: 'left',
});

const Td = styled('td')({
  padding: '10px 12px',
  borderBottom: '1px solid #f5f5f5',
  verticalAlign: 'middle',
});

const RateBtn = styled('button')({
  backgroundColor: '#fff8e1',
  color: '#e67e22',
  border: '1px solid #f0c040',
  borderRadius: 6,
  padding: '5px 12px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  '&:hover': { backgroundColor: '#fdeeba' },
});

const RatedBadge = styled('span')({
  color: '#27ae60',
  fontSize: 13,
  fontWeight: 600,
});

const Overlay = styled('div')({
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
});

const Modal = styled('div')({
  backgroundColor: 'white',
  borderRadius: 12,
  padding: 28,
  width: '100%',
  maxWidth: 420,
  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
});

const ModalTitle = styled('h2')({
  fontSize: 18,
  fontWeight: 700,
  margin: '0 0 4px',
  color: '#222',
});

const ProductName = styled('p')({
  fontSize: 14,
  color: '#888',
  margin: '0 0 4px',
});

const RatingHint = styled('p')({
  fontSize: 13,
  color: '#f39c12',
  fontWeight: 600,
  margin: '4px 0 12px',
  minHeight: 20,
});

const CommentBox = styled('textarea')({
  width: '100%',
  border: '1px solid #ddd',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 14,
  resize: 'vertical',
  outline: 'none',
  boxSizing: 'border-box',
  '&:focus': { borderColor: '#c0392b' },
});

const ErrMsg = styled('p')({
  color: '#c0392b',
  fontSize: 13,
  margin: '8px 0 0',
});

const ModalFooter = styled('div')({
  display: 'flex',
  gap: 10,
  marginTop: 16,
});

const SubmitBtn = styled('button')(props => ({
  flex: 1,
  backgroundColor: props.disabled ? '#e0e0e0' : '#c0392b',
  color: props.disabled ? '#aaa' : 'white',
  border: 'none',
  borderRadius: 8,
  padding: '11px 0',
  fontSize: 14,
  fontWeight: 700,
  cursor: props.disabled ? 'not-allowed' : 'pointer',
}));

const CancelBtn = styled('button')({
  backgroundColor: '#f5f5f5',
  color: '#555',
  border: 'none',
  borderRadius: 8,
  padding: '11px 20px',
  fontSize: 14,
  cursor: 'pointer',
});
