import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const springValues = {
  damping: 30,
  stiffness: 100,
  mass: 2,
};

export default function TiltedCard({
  imageSrc,
  altText = "Course image",
  title = "",
  subtitle = "",
  description = "",
  rating = 0,
  ratingCount = 0,
  price = "",
  oldPrice = "",
  badge = "",
  containerHeight = "340px",
  containerWidth = "300px",
  imageHeight = "140px",
  imageWidth = "100%",
  scaleOnHover = 1,
  rotateAmplitude = 25,
  showMobileWarning = false,
}) {
  const ref = useRef(null);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);

  function handleMouse(e) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;
    rotateX.set(rotationX);
    rotateY.set(rotationY);
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover);
  }

  function handleMouseLeave() {
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
  }

  // Render stars for rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (rating >= i - 0.5) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star">☆</span>);
      }
    }
    return stars;
  };

  return (
    <motion.div
      ref={ref}
      className="udemy-tilted-card"
      style={{
        height: containerHeight,
        width: containerWidth,
        rotateX,
        rotateY,
        scale,
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showMobileWarning && (
        <div className="tilted-card-mobile-warning">This effect is not optimized for mobile. Check on desktop.</div>
      )}
      <div className="udemy-card-img-wrap">
        <img
          src={imageSrc}
          alt={altText}
          className="udemy-tilted-card-img"
          style={{ width: imageWidth, height: imageHeight }}
        />
        <div className="udemy-card-img-overlay">
          <div className="udemy-card-title">{title}</div>
          {subtitle && <div className="udemy-card-subtitle">{subtitle}</div>}
          {badge && <div className="udemy-card-badge">{badge}</div>}
        </div>
      </div>
      <div className="udemy-card-body">
        {description && <div className="udemy-card-desc">{description}</div>}
        {(typeof rating === 'number' && !isNaN(rating)) ? (
          <div className="udemy-card-rating-row">
            <span className="udemy-card-rating-num">{rating.toFixed(1)}</span>
            <span className="udemy-card-stars">{renderStars(rating)}</span>
            {typeof ratingCount === 'number' && !isNaN(ratingCount) ? (
              <span className="udemy-card-rating-count">({ratingCount.toLocaleString()})</span>
            ) : null}
          </div>
        ) : null}
        <div className="udemy-card-price-row">
          {oldPrice && <span className="udemy-card-old-price">{oldPrice}</span>}
          <span className="udemy-card-price">{price}</span>
        </div>
      </div>
    </motion.div>
  );
} 