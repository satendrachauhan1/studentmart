import { useState } from "react";

import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";

import Dashboard from "./pages/Dashboard.jsx";

import SellProduct from "./pages/SellProduct.jsx";

import Products from "./pages/Products.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";

import Cart from "./pages/Cart.jsx";

import Checkout from "./pages/Checkout.jsx";

import OrderSuccess from "./pages/OrderSuccess.jsx";

import Orders from "./pages/Orders.jsx";
import Profile from "./pages/Profile.jsx";
import AppSidebar from "./components/AppSidebar.jsx";
import BookRequests from "./pages/BookRequests.jsx";
import ProductOffers from "./pages/ProductOffers.jsx";


function App() {

    // ============================================
    // PAGE
    // ============================================

    const [page, setPage] =
        useState("register");


    // ============================================
    // SELECTED PRODUCT
    // ============================================

    const [selectedProduct, setSelectedProduct] =
        useState(null);


    // ============================================
    // PLACED ORDER
    // ============================================

    const [placedOrder, setPlacedOrder] =
        useState(null);

    const [checkoutCartKeys, setCheckoutCartKeys] = useState([]);


    // ============================================
    // CHECK LOGIN
    // ============================================

    const token =
        localStorage.getItem("token");

    const withSidebar = (content) => (
        <div className="app-shell">
            <AppSidebar activePage={page} onNavigate={setPage} />
            <div className="app-content">{content}</div>
        </div>
    );


    // ============================================
    // LOGGED-IN USER
    // ============================================

    if (token) {


        // ========================================
        // DASHBOARD
        // ========================================

        if (page === "dashboard") {

            return (
                <Dashboard

                    onSellClick={() => {
                        setPage("sell");
                    }}


                    onBrowseClick={() => {
                        setPage("products");
                    }}


                    onCartClick={() => {
                        setPage("cart");
                    }}


                    onOrdersClick={() => {
                        setPage("orders");
                    }}

                    onProfileClick={() => setPage("profile")}
                    onRequestsClick={() => setPage("requests")}
                    onOffersClick={() => setPage("offers")}
                    onProductClick={(product) => { setSelectedProduct(product); setPage("details"); }}

                />
            );
        }

        if (page === "profile") {
            return withSidebar(<Profile onBack={() => setPage("dashboard")} />);
        }

        if (page === "requests") {
            return withSidebar(<BookRequests onBack={() => setPage("dashboard")} />);
        }

        if (page === "offers") {
            return withSidebar(<ProductOffers onBack={() => setPage("dashboard")} />);
        }


        // ========================================
        // SELL PRODUCT
        // ========================================

        if (page === "sell") {

            return withSidebar(
                <SellProduct
                    onBack={() => {
                        setPage("dashboard");
                    }}
                />
            );
        }


        // ========================================
        // PRODUCTS
        // ========================================

        if (page === "products") {

            return withSidebar(
                <Products

                    onBack={() => {
                        setPage("dashboard");
                    }}

                    onCartClick={() => setPage("cart")}


                    onProductClick={(product) => {

                        console.log(
                            "SELECTED PRODUCT:",
                            product
                        );

                        setSelectedProduct(
                            product
                        );

                        setPage("details");

                    }}

                />
            );
        }


        // ========================================
        // PRODUCT DETAILS
        // ========================================

        if (page === "details") {

            return withSidebar(
                <ProductDetails

                    product={
                        selectedProduct
                    }


                    onBack={() => {
                        setPage("products");
                    }}


                    onCart={() => {
                        setPage("cart");
                    }}

                    onOffers={() => setPage("offers")}

                />
            );
        }


        // ========================================
        // CART
        // ========================================

        if (page === "cart") {

            return withSidebar(
                <Cart

                    onBack={() => {
                        setPage("dashboard");
                    }}


                    onCheckout={(selectedKeys) => {
                        setCheckoutCartKeys(selectedKeys);
                        setPage("checkout");
                    }}

                />
            );
        }


        // ========================================
        // CHECKOUT
        // ========================================

        if (page === "checkout") {

            return withSidebar(
                <Checkout

                    selectedCartKeys={checkoutCartKeys}

                    onBack={() => {
                        setPage("cart");
                    }}


                    onOrderPlaced={(order) => {

                        console.log(
                            "ORDER PLACED:",
                            order
                        );


                        setPlacedOrder(
                            order
                        );


                        setPage(
                            "order-success"
                        );

                    }}

                />
            );
        }


        // ========================================
        // ORDER SUCCESS
        // ========================================

        if (page === "order-success") {

            return withSidebar(
                <OrderSuccess

                    order={
                        placedOrder
                    }


                    onContinueShopping={() => {

                        setPage(
                            "products"
                        );

                    }}


                    onViewOrders={() => {

                        setPage(
                            "orders"
                        );

                    }}

                />
            );
        }


        // ========================================
        // MY ORDERS
        // ========================================

        if (page === "orders") {

            return withSidebar(
                <Orders

                    onBack={() => {
                        setPage(
                            "dashboard"
                        );
                    }}


                    onViewOrder={(order) => {

                        console.log(
                            "VIEW ORDER:",
                            order
                        );

                    }}

                />
            );
        }


        // ========================================
        // FALLBACK
        // ========================================

        return (<Dashboard
        onSellClick={() => setPage("sell")}
        onBrowseClick={() => setPage("products")}
        onCartClick={() => setPage("cart")}
        onOrdersClick={() => setPage("orders")}
        onProfileClick={() => setPage("profile")}
        onRequestsClick={() => setPage("requests")}
        onOffersClick={() => setPage("offers")}
        onProductClick={(product) => { setSelectedProduct(product); setPage("details"); }}
    />);
    }


    // ============================================
    // LOGGED-OUT USER
    // ============================================

    return (
        <>

            {/* =====================================
                REGISTER
            ===================================== */}

            {page === "register" && (

                <Register

                    onRegisterSuccess={() => {
                        setPage("login");
                    }}


                    onLoginClick={() => {
                        setPage("login");
                    }}

                />

            )}


            {/* =====================================
                LOGIN
            ===================================== */}

            {page === "login" && (

                <Login

                    onRegisterClick={() => {
                        setPage("register");
                    }}

                />

            )}

        </>
    );
}


export default App;
