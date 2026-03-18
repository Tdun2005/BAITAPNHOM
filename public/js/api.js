/**
 * SmartBusAI — Shared API Utility
 * Dùng chung cho tất cả các trang frontend
 */

const API_BASE = "/api";

/* ── Lấy user từ localStorage ── */
function getUser() {
    try { return JSON.parse(localStorage.getItem("user")) || null; }
    catch { return null; }
}

function getUserId() {
    return localStorage.getItem("user_id") || getUser()?.user_id || null;
}

function getRole() {
    return getUser()?.role || null;
}

/* ── Kiểm tra đăng nhập, redirect nếu chưa login ── */
function requireLogin(redirectTo = "/pages/auth/login.html") {
    if (!getUser()) {
        window.location.href = redirectTo;
        return false;
    }
    return true;
}

/* ── Kiểm tra role ── */
function requireRole(role, redirectTo = "/pages/auth/login.html") {
    const user = getUser();
    if (!user || user.role !== role) {
        window.location.href = redirectTo;
        return false;
    }
    return true;
}

/* ── Đăng xuất ── */
function logout() {
    localStorage.clear();
    window.location.href = "/pages/auth/login.html";
}

/* ── Generic fetch wrapper ── */
async function apiFetch(endpoint, options = {}) {
    try {
        const res = await fetch(API_BASE + endpoint, {
            headers: { "Content-Type": "application/json", ...options.headers },
            ...options
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw { status: res.status, message: data.message || "Lỗi server" };
        return data;
    } catch (err) {
        if (err.status) throw err;
        throw { status: 0, message: "Không kết nối được server" };
    }
}

const api = {
    get:    (ep) => apiFetch(ep),
    post:   (ep, body) => apiFetch(ep, { method: "POST", body: JSON.stringify(body) }),
    put:    (ep, body) => apiFetch(ep, { method: "PUT",  body: JSON.stringify(body) }),
    delete: (ep)       => apiFetch(ep, { method: "DELETE" }),
};

/* ── Format tiền VNĐ ── */
function formatMoney(n) {
    if (!n && n !== 0) return "—";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

/* ── Format ngày giờ ── */
function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}

/* ── Toast notification ── */
function showToast(message, type = "success") {
    const existing = document.getElementById("_toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "_toast";
    const colors = { success: "#2ecc71", error: "#e74c3c", warning: "#f39c12", info: "#00a8ff" };
    toast.style.cssText = `
        position:fixed; bottom:28px; right:28px; z-index:99999;
        background:${colors[type] || colors.success};
        color:#fff; padding:13px 22px; border-radius:12px;
        font-size:14px; font-weight:600;
        box-shadow:0 4px 24px rgba(0,0,0,.35);
        animation:_toastIn .25s ease;
        max-width:340px; word-break:break-word;
    `;
    const style = document.createElement("style");
    style.textContent = `@keyframes _toastIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`;
    document.head.appendChild(style);
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
