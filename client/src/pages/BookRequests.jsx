import { useEffect, useState } from "react";

const API = `${import.meta.env.VITE_API_URL || ""}/api/book-requests`;

function BookRequests({ onBack }) {
    const [requests, setRequests] = useState([]);
    const [form, setForm] = useState({ lookingFor: "", budget: "", urgency: "This Week" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const token = localStorage.getItem("token");
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const currentUserId = currentUser?.id || currentUser?._id;

    const loadRequests = async () => {
        setLoading(true);
        try {
            const response = await fetch(API, { headers: { Authorization: `Bearer ${token}` } });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Unable to load book requests");
            setRequests(data.requests || []);
        } catch (err) { setError(err.message); } finally { setLoading(false); }
    };

    useEffect(() => { loadRequests(); }, []);

    const submit = async (event) => {
        event.preventDefault(); setSaving(true); setError(""); setNotice("");
        try {
            const response = await fetch(API, {
                method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(form)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Unable to post request");
            setRequests((current) => [data.request, ...current]);
            setForm({ lookingFor: "", budget: "", urgency: "This Week" });
            setNotice("Your request is on the campus wish board.");
        } catch (err) { setError(err.message); } finally { setSaving(false); }
    };

    const respond = async (requestId, offerId, status) => {
        setError(""); setNotice("");
        try {
            const response = await fetch(`${API}/${requestId}/offers/${offerId}`, {
                method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Unable to update request");
            setRequests((current) => current.map((item) => item._id === requestId ? data.request : item));
            setNotice(status === "accepted" ? "Offer accepted and request marked fulfilled." : "Offer declined.");
        } catch (err) { setError(err.message); }
    };

    const offerHelp = async (requestId) => {
        setError(""); setNotice("");
        try {
            const response = await fetch(`${API}/${requestId}/offers`, {
                method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ message: "I can help you find this item. Please contact me." })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Unable to send offer");
            setRequests((current) => current.map((item) => item._id === requestId ? data.request : item));
            setNotice("Your offer was sent to the student.");
        } catch (err) { setError(err.message); }
    };

    const markFulfilled = async (requestId) => {
        setError(""); setNotice("");
        try {
            const response = await fetch(`${API}/${requestId}/fulfill`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Unable to update request");
            setRequests((current) => current.map((request) => request._id === requestId ? data.request : request));
            setNotice("Request marked fulfilled.");
        } catch (err) { setError(err.message); }
    };

    return <main className="book-requests-page">
        <header className="book-requests-heading">
            <button type="button" onClick={onBack}>← Dashboard</button>
            <span>CAMPUS WISH BOARD</span>
            <h1>Book &amp; item requests</h1>
            <p>Post what you need or help another student find it.</p>
        </header>
        {error && <div className="profile-alert profile-error" role="alert">{error}</div>}
        {notice && <div className="profile-alert profile-success" role="status">{notice}</div>}
        <div className="book-requests-layout">
            <form className="profile-card request-form" onSubmit={submit}>
                <div className="profile-card-heading"><span className="profile-icon">＋</span><div><h2>Request an item</h2><p>Your request will be visible to signed-in students.</p></div></div>
                <label>Book or item title<input required maxLength="160" value={form.lookingFor} onChange={(e) => setForm({ ...form, lookingFor: e.target.value })} placeholder="e.g. The Hobbit or a DBMS textbook" /></label>
                <label>Budget or swap preference<input maxLength="80" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="e.g. Up to ₹300 or open to swap" /></label>
                <label>When do you need it?<select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}><option>Today / Tomorrow</option><option>This Week</option><option>Before Internals</option><option>Whenever available</option></select></label>
                <button className="profile-submit" disabled={saving}>{saving ? "Posting…" : "Post request"}</button>
            </form>
            <section className="request-list">
                <div className="request-list-heading"><h2>Open requests</h2><span>{requests.filter((item) => !item.fulfilled).length} open</span></div>
                {loading ? <p className="request-empty">Loading requests…</p> : requests.length === 0 ? <p className="request-empty">No requests yet. Add the first one.</p> : requests.map((item) => {
                    const isOwner = (item.user?._id || item.user) === currentUserId;
                    const ownOffer = item.offers?.some((offer) => (offer.user?._id || offer.user) === currentUserId);
                    return <article className={`request-card${item.fulfilled ? " fulfilled" : ""}`} key={item._id}>
                    <div className="request-card-top"><span className="request-status">{item.fulfilled ? "Fulfilled" : item.urgency}</span><time>{new Date(item.createdAt).toLocaleDateString()}</time></div>
                    <h3>{item.lookingFor}</h3>
                    <p>Requested by {item.user?.name || "Student"}</p>
                    {item.budget && <div className="request-budget">Budget / swap: <strong>{item.budget}</strong></div>}
                    {item.offers?.length > 0 && <div className="request-offers"><strong>{item.offers.length} student offer{item.offers.length === 1 ? "" : "s"}</strong>{item.offers.map((offer) => <div className="request-offer" key={offer._id}><span>{offer.user?.name || "Student"} · {offer.status}</span>{isOwner && !item.fulfilled && offer.status === "pending" && <span className="request-offer-actions"><button onClick={() => respond(item._id, offer._id, "accepted")}>Accept</button><button onClick={() => respond(item._id, offer._id, "declined")}>Decline</button></span>}</div>)}</div>}
                    {!item.fulfilled && isOwner && <button type="button" className="request-help-button" onClick={() => markFulfilled(item._id)}>Mark fulfilled</button>}
                    {!item.fulfilled && !isOwner && !ownOffer && <button type="button" className="request-help-button" onClick={() => offerHelp(item._id)}>Offer help</button>}
                    {!item.fulfilled && !isOwner && ownOffer && <span className="request-offer-sent">Offer sent</span>}
                </article>;
                })}
            </section>
        </div>
    </main>;
}

export default BookRequests;
