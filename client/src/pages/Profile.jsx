import { useEffect, useState } from "react";

const API = `${import.meta.env.VITE_API_URL || ""}/api/auth`;

async function readResponse(response) {
    if (!(response.headers.get("content-type") || "").includes("application/json")) {
        throw new Error("Can't reach the StudentMart API. Start the server and try again.");
    }
    return response.json();
}

function Profile({ onBack }) {
    const [profile, setProfile] = useState({ name: "", email: "", phone: "", bio: "", studentId: "", department: "", semester: "", pickupLocation: "", gender: "" });
    const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");
    const token = localStorage.getItem("token");

    const saveGenderChoice = async (gender) => {
        const nextProfile = { ...profile, gender };
        setProfile(nextProfile);
        setError("");
        setNotice("Saving gender preference…");
        try {
            const response = await fetch(`${API}/profile`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(nextProfile)
            });
            const data = await readResponse(response);
            if (!response.ok) throw new Error(data.message || "Could not save gender preference");
            const savedUser = { ...data.user, gender: data.user.gender || gender };
            localStorage.setItem("user", JSON.stringify(savedUser));
            setNotice("Gender saved. Your dashboard avatar is updated.");
        } catch (err) {
            setError(err.message);
            setNotice("");
        }
    };

    useEffect(() => {
        fetch(`${API}/profile`, { headers: { Authorization: `Bearer ${token}` } })
            .then(async (response) => {
                const data = await readResponse(response);
                if (!response.ok) throw new Error(data.message || "Could not load profile");
                setProfile({ name: data.user.name || "", email: data.user.email || "", phone: data.user.phone || "", bio: data.user.bio || "", studentId: data.user.studentId || "", department: data.user.department || "", semester: data.user.semester || "", pickupLocation: data.user.pickupLocation || "", gender: data.user.gender || "" });
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [token]);

    const updateProfile = async (event) => {
        event.preventDefault(); setError(""); setNotice(""); setSaving(true);
        try {
            const response = await fetch(`${API}/profile`, {
                method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(profile)
            });
            const data = await readResponse(response);
            if (!response.ok) throw new Error(data.message || "Could not save profile");
            const savedGender = data.user.gender || profile.gender || "";
            setProfile({ name: data.user.name, email: data.user.email, phone: data.user.phone, bio: data.user.bio, studentId: data.user.studentId, department: data.user.department, semester: data.user.semester, pickupLocation: data.user.pickupLocation, gender: savedGender });
            localStorage.setItem("user", JSON.stringify({ ...data.user, gender: savedGender })); setNotice("Your profile has been saved.");
        } catch (err) { setError(err.message); } finally { setSaving(false); }
    };

    const changePassword = async (event) => {
        event.preventDefault(); setError(""); setNotice("");
        if (passwords.newPassword !== passwords.confirmPassword) { setError("New passwords do not match."); return; }
        if (passwords.newPassword.length < 8) { setError("New password must be at least 8 characters."); return; }
        setSaving(true);
        try {
            const response = await fetch(`${API}/change-password`, {
                method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword })
            });
            const data = await readResponse(response);
            if (!response.ok) throw new Error(data.message || "Could not change password");
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" }); setNotice(data.message);
        } catch (err) { setError(err.message); } finally { setSaving(false); }
    };

    if (loading) return <div className="profile-page"><p>Loading your profile…</p></div>;

    return <main className="profile-page">
        <header className="profile-heading">
            <button className="profile-back" type="button" onClick={onBack}>← Back to dashboard</button>
            <span className="profile-eyebrow">YOUR ACCOUNT</span>
            <h1>Profile &amp; security</h1>
            <p>Keep your details up to date and manage your password.</p>
        </header>
        {error && <div className="profile-alert profile-error" role="alert">{error}</div>}
        {notice && <div className="profile-alert profile-success" role="status">{notice}</div>}
        <div className="profile-layout">
            <form className="profile-card" onSubmit={updateProfile}>
                <div className="profile-card-heading"><span className="profile-icon">◉</span><div><h2>Personal details</h2><p>Information connected to your account.</p></div></div>
                <label>Full name<input required minLength="2" maxLength="80" autoComplete="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></label>
                <label>Email address<input required type="email" autoComplete="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></label>
                <label>Phone number <span className="profile-optional">Optional</span><input type="tel" maxLength="20" autoComplete="tel" placeholder="Add a contact number" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></label>
                <label>Student ID <span className="profile-optional">Optional</span><input maxLength="30" value={profile.studentId} onChange={(e) => setProfile({ ...profile, studentId: e.target.value })} placeholder="Your student ID" /></label>
                <label>Gender for dashboard illustration<select value={profile.gender} onChange={(e) => saveGenderChoice(e.target.value)}><option value="">Choose gender</option><option value="female">Female</option><option value="male">Male</option><option value="prefer-not-to-say">Prefer not to say</option></select></label>
                <label>Department <span className="profile-optional">Optional</span><input maxLength="100" value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} placeholder="Your department" /></label>
                <label>Semester <span className="profile-optional">Optional</span><input maxLength="40" value={profile.semester} onChange={(e) => setProfile({ ...profile, semester: e.target.value })} placeholder="e.g. Semester 5" /></label>
                <label>Preferred campus pickup point <span className="profile-optional">Optional</span><input maxLength="120" value={profile.pickupLocation} onChange={(e) => setProfile({ ...profile, pickupLocation: e.target.value })} placeholder="e.g. Library entrance" /></label>
                <label>About you <span className="profile-optional">Optional</span><textarea maxLength="300" rows="4" placeholder="A short introduction for other students" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /><small className="profile-count">{profile.bio.length}/300</small></label>
                <button className="profile-submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
            </form>
            <form className="profile-card" onSubmit={changePassword}>
                <div className="profile-card-heading"><span className="profile-icon">⌑</span><div><h2>Change password</h2><p>Use at least 8 characters for your new password.</p></div></div>
                <label>Current password<input required type="password" autoComplete="current-password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} /></label>
                <label>New password<input required type="password" minLength="8" autoComplete="new-password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} /></label>
                <label>Confirm new password<input required type="password" minLength="8" autoComplete="new-password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} /></label>
                <button className="profile-submit profile-secondary" disabled={saving}>{saving ? "Updating…" : "Update password"}</button>
                <div className="profile-security-note"><span>✦</span><p>Your password is securely hashed and never shown in your profile.</p></div>
            </form>
        </div>
    </main>;
}

export default Profile;
