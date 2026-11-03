import { useCallback, useEffect, useState } from "react";

function ProductOffers({ onBack }) {
    const [offers, setOffers] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState("");
    const token = localStorage.getItem("token");
    const api = import.meta.env.VITE_API_URL || "";

    const loadOffers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${api}/api/product-offers/incoming`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Unable to load offers");
            setOffers(data.offers || []);
            setError("");
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    }, [api, token]);

    useEffect(() => { loadOffers(); }, [loadOffers]);

    const respond = async (offer, status) => {
        let counterPrice;
        if (status === "countered") {
            const answer = window.prompt("Enter your counter-offer amount (₹):", String(offer.offerPrice));
            if (answer === null) return;
            counterPrice = Number(answer);
            if (!Number.isFinite(counterPrice) || counterPrice < 0) { setError("Enter a valid counter-offer amount."); return; }
        }
        setBusyId(offer._id);
        setError("");
        try {
            const response = await fetch(`${api}/api/product-offers/${offer._id}/respond`, {
                method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status, counterPrice })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Unable to update offer");
            setOffers((items) => items.map((item) => item._id === offer._id ? data.offer : item));
        } catch (err) { setError(err.message); }
        finally { setBusyId(""); }
    };

    return <main className="product-offers-page">
        <header className="product-offers-heading"><button type="button" onClick={onBack}>← Dashboard</button><span>SELLER TOOLS</span><h1>Buyer offers</h1><p>Review offers students have sent for your listings.</p></header>
        {error && <div className="product-error-message" role="alert">{error}</div>}
        {loading ? <p className="offer-empty">Loading offers…</p> : offers.length === 0 ? <p className="offer-empty">No offers yet. Offers on your products will appear here.</p> : <section className="product-offer-list">
            {offers.map((offer) => <article className="product-offer-card" key={offer._id}>
                <div className="product-offer-top"><div><span>{offer.product?.category || "Listing"}</span><h2>{offer.product?.title || "Product unavailable"}</h2></div><strong className={`product-offer-status ${offer.status}`}>{offer.status}</strong></div>
                <div className="product-offer-prices"><span>Listed <b>₹{Number(offer.product?.price || 0).toLocaleString("en-IN")}</b></span><span>Offer <b>₹{Number(offer.offerPrice).toLocaleString("en-IN")}</b></span>{offer.counterPrice != null && <span>Your counter <b>₹{Number(offer.counterPrice).toLocaleString("en-IN")}</b></span>}</div>
                <p className="product-offer-buyer">From {offer.buyer?.name || "Student"}{offer.buyer?.email ? ` · ${offer.buyer.email}` : ""}</p>
                {offer.message && <p className="product-offer-message">“{offer.message}”</p>}{offer.pickupProposal && <p className="product-offer-message">Pickup suggestion: {offer.pickupProposal}</p>}
                {offer.status === "pending" && <div className="product-offer-actions"><button type="button" disabled={busyId === offer._id} onClick={() => respond(offer, "accepted")}>Accept</button><button type="button" disabled={busyId === offer._id} onClick={() => respond(offer, "countered")}>Counter offer</button><button type="button" disabled={busyId === offer._id} onClick={() => respond(offer, "declined")}>Decline</button></div>}
            </article>)}
        </section>}
    </main>;
}

export default ProductOffers;
