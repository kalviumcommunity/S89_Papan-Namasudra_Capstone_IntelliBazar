import { Link, useNavigate } from "react-router-dom";
import "../styles/collections.css";
import ChatbotFloat from "../components/ChatbotFloat";

const categories = [
  {
    title: "Fashions",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIbB_jgxoaV0-TK5KPsFxkca5cEROonM0Utg&s",
    products: "1462 products",
  },
  {
    title: "Electronics",
    image: "https://static-assets.business.amazon.com/assets/in/24th-jan/705_Website_Blog_Appliances_1450x664.jpg.transform/1450x664/image.jpg",
    products: "89 products",
  },
  {
    title: "Watches",
    image: "https://static.helioswatchstore.com/media/easyslide/Artboard_6-25.jpg",
    products: "98 products",
  },
  {
    title: "Footwear",
    image: "https://bedrocksandals.com/cdn/shop/files/BEDROCK_2024_070824_BydlonAndrew_Bedrock100123_BydlonAndrewBEDROCK_HiRes_070324_BydlonAndrewBedrock100123_BydlonAndrew0366_1600x.jpg?v=1739553730",
    products: "102 products",
  },
  {
    title: "Home decor",
    image: "https://i.ytimg.com/vi/xYYsZwuX2C8/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAaQ-FCpu1SQWVmEC-lxVwKaBiBAQ",
    products: "478 products",
  },
  {
    title: "Books",
    image: "https://i0.wp.com/apeejay.news/wp-content/uploads/2023/10/281023-10-most-read-books-Feature.jpg?fit=569%2C509&ssl=1",
    products: "387 products",
  },
  {
    title: "Kitchen",
    image: "https://platform.eater.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/19859137/shutterstock_1042252666.jpg?quality=90&strip=all&crop=0,10.607986971708,100,78.784026056585",
    products: "247 products",
  },
  {
    title: "Sports",
    image: "https://st.depositphotos.com/1875851/1555/i/450/depositphotos_15558827-stock-photo-balls-in-sport.jpg",
    products: "547 products",
  },
];

const featured = [
  {
    title: "New Arrivals",
    description: "Discover our latest products and be the first to try them",
    image: "https://www.cato.org/sites/cato.org/files/styles/optimized/public/2023-11/fast-fashion2.jpeg?itok=qCMa7eGV",
    buttonText: "Shop Now",
    buttonColor: "primary",
  },
  {
    title: "Special Offers",
    description: "Limited-time discounts on select products",
    image: "https://naymestreet.com/cdn/shop/files/onsale.png?v=1741606263&width=1080",
    buttonText: "View Deals",
    buttonColor: "secondary",
  },
];

export default function Collections() {
  const navigate = useNavigate();

  // Handle button clicks for featured collections
  const handleFeatureClick = (title) => {
    if (title === "New Arrivals") {
      navigate("/new-arrivals");
    } else if (title === "Special Offers") {
      navigate("/special-offers");
    }
  };

  return (
    <div className="collections-container">
      <div className="header-section">
        <button onClick={() => navigate(-1)} className="back-arrow-btn" title="Go back">
          ←
        </button>
        <h1 className="section-title">Collections</h1>
      </div>
      <p className="section-subtitle">
        Explore our wide range of products across different categories, curated for quality and style
      </p>

      <div className="category-grid">
        {categories.map((item, idx) => {
          // Map category titles to their dedicated page routes
          const getRouteForCategory = (title) => {
            switch (title) {
              case "Fashions":
                return "/fashion";
              case "Electronics":
                return "/electronics";
              case "Watches":
                return "/watches";
              case "Footwear":
                return "/footwear";
              case "Home decor":
                return "/home-decor";
              case "Books":
                return "/books";
              case "Kitchen":
                return "/kitchen";
              case "Sports":
                return "/sports";
              default:
                return `/shop?category=${encodeURIComponent(title)}`;
            }
          };

          return (
            <Link
              key={idx}
              to={getRouteForCategory(item.title)}
              className="category-card"
            >
              <img src={item.image} alt={item.title} />
              <div className="category-label">
                <h4>{item.title}</h4>
                <p>{item.products}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <h2 className="section-title">Feature collections</h2>
      <div className="featured-grid">
        {featured.map((item, idx) => (
          <div className="featured-card" key={idx}>
            <img src={item.image} alt={item.title} />
            <div className="featured-info">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <button
                className={`btn-${item.buttonColor}`}
                onClick={() => handleFeatureClick(item.title)}
              >
                {item.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Floating Chatbot */}
      <ChatbotFloat />
    </div>
  );
}