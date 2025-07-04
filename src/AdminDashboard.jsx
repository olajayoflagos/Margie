import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  startAfter
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import "./AdminDashboard.css";

// Inline PDF styles
const pdfStyles = StyleSheet.create({
  page: { padding: 30, fontFamily: "Helvetica" },
  header: { fontSize: 18, marginBottom: 20, textAlign: "center" },
  section: { marginBottom: 10, lineHeight: 1.5 }
});

// PDF receipt component
const ReceiptPDF = ({ booking }) => (
  <Document>
    <Page style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Text>Margies Booking Receipt</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text>Booking ID: {booking.id}</Text>
        <Text>Guest: {booking.guestName}</Text>
        <Text>Room: {booking.roomName}</Text>
        <Text>
          Dates: {booking.checkIn} → {booking.checkOut}
        </Text>
        <Text>Paid: ₦{booking.amountPaid}</Text>
        <Text>Status: {booking.status}</Text>
      </View>
    </Page>
  </Document>
);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [lastMsgDoc, setLastMsgDoc] = useState(null);
  const [lastBkDoc, setLastBkDoc] = useState(null);

  useEffect(() => {
    async function load() {
      // Paginate queries to reduce reads (Spark: 125K/month)
      const msgQuery = query(collection(db, "messages"), limit(10));
      const bkQuery = query(
        collection(db, "bookings"),
        where("status", "!=", "cancelled"),
        limit(10)
      );
      const [msgSnap, bkSnap] = await Promise.all([getDocs(msgQuery), getDocs(bkQuery)]);
      setMessages(msgSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setBookings(bkSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLastMsgDoc(msgSnap.docs[msgSnap.docs.length - 1]);
      setLastBkDoc(bkSnap.docs[bkSnap.docs.length - 1]);
      setLoading(false);
    }
    load();
  }, []);

  const loadMore = async () => {
    if (!lastMsgDoc || !lastBkDoc) return;
    const msgQuery = query(
      collection(db, "messages"),
      startAfter(lastMsgDoc),
      limit(10)
    );
    const bkQuery = query(
      collection(db, "bookings"),
      where("status", "!=", "cancelled"),
      startAfter(lastBkDoc),
      limit(10)
    );
    const [msgSnap, bkSnap] = await Promise.all([getDocs(msgQuery), getDocs(bkQuery)]);
    setMessages(ms => [...ms, ...msgSnap.docs.map(d => ({ id: d.id, ...d.data() }))]);
    setBookings(bs => [...bs, ...bkSnap.docs.map(d => ({ id: d.id, ...d.data() }))]);
    setLastMsgDoc(msgSnap.docs[msgSnap.docs.length - 1]);
    setLastBkDoc(bkSnap.docs[bkSnap.docs.length - 1]);
  };

  const filteredMsgs = messages.filter(m =>
    (m.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (m.email ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const filteredBks = bookings.filter(b =>
    (b.guestName ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (b.roomName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p>Loading…</p>;

  return (
    <div className="admin-dashboard">
      <header>
        <h1>Admin Dashboard</h1>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
         <button
   className="admin-logout"
   onClick={async () => {
     await signOut(auth);
   }}
 >
   Logout
 </button>
      </header>

      <section>
        <h2>Messages ({filteredMsgs.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Message</th><th>Date</th><th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredMsgs.map(m => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.email}</td>
                <td>{m.message}</td>
                <td>{m.created?.toDate().toLocaleString()}</td>
                <td>
                  <button onClick={async () => {
                    await deleteDoc(doc(db, "messages", m.id));
                    setMessages(ms => ms.filter(x => x.id !== m.id));
                  }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={loadMore} disabled={!lastMsgDoc}>Load More Messages</button>
      </section>

      <section>
        <h2>Bookings ({filteredBks.length})</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Guest</th><th>Room</th><th>Dates</th><th>Paid</th><th>Status</th><th>Receipt</th><th>Confirm</th>
            </tr>
          </thead>
          <tbody>
            {filteredBks.map(b => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.guestName}</td>
                <td>{b.roomName}</td>
                <td>{b.checkIn}–{b.checkOut}</td>
                <td>₦{b.amountPaid}</td>
                <td>{b.status}</td>
                <td>
                  <PDFDownloadLink
                    document={<ReceiptPDF booking={b} />}
                    fileName={`receipt_${b.id}.pdf`}
                  >
                    {({ loading }) => (loading ? "…" : "Download")}
                  </PDFDownloadLink>
                </td>
                <td>
                  {b.status === "request_pending" && (
                    <button onClick={async () => {
                      await updateDoc(doc(db, "bookings", b.id), { status: "confirmed" });
                      setBookings(bs => bs.map(x => x.id === b.id ? { ...x, status: "confirmed" } : x));
                    }}>Confirm</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={loadMore} disabled={!lastBkDoc}>Load More Bookings</button>
      </section>
    </div>
  );
}