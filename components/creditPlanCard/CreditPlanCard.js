import React, { useEffect, useState } from "react";
import styles from "./CreditPlanCard.module.css";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useMediaQuery, useTheme } from "@mui/material";
import { priceStructure } from "../../constant/Constant";
import { Typography } from "@mui/material";

function CreditPlanCard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [priceDetails, setPriceDetails] = useState([]);

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    const Price = priceStructure.filter((item) => item.country === "Others Country");
    setPriceDetails(Price);
  }, []);

  const successPaymentHandler = async (price) => {
    try {
      if (!session) {
        router.push("/login");
        return;
      }
      if (price === 0) {
        router.push("/ai-image-editor");
        return;
      }

      if (session) {
        const response = await fetch("/api/razorpayPayment/createCheckout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: price }),
        });
        const { order } = await response.json();

        const options = {
          key: process.env.RAZORPAY_TEST_KEY_ID,
          amount: order.amount,
          name: 'PicFix.ai',
          currency: order.currency,
          image: 'https://www.picfix.ai/favicon.ico',
          order_id: order.id,
          callback_url: "api/razorpayPayment/verifyPayment",
          prefill: {
            name: session.user.name,
            email: session.user.email,
          },
          theme: {
            "color": "#b2b2ff"
          }
        };
        const razor = new window.Razorpay(options);
        razor.open();
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
    }
  };

  const getPlanBadge = (planName) => {
    switch (planName) {
      case "free":
        return { label: "FREE PLAN", color: "#e68a4a" };
      case "standard":
        return { label: "BASIC PLAN", color: "#4ecdc4" };
      case "popular":
        return { label: "POPULAR PLAN", color: "#3a1c71" };
      case "premium":
        return { label: "PREMIUM PLAN", color: "#d76d77" };
      default:
        return { label: "BASIC PLAN", color: "#4ecdc4" };
    }
  };

  // const getFeatures = (item) => [
  //   `${item.creditPoints - item.extraCreditPoints} Photo Credits`,
  //   ...(item.extraCreditPoints != 0 ? [`+${item.extraCreditPoints} Credits Extra`] : []),
  //   "Free access of 3 models",
  //   `Storage: ${item.storage}`,
  //   item.name === "free" ? "Limited access of models" : "Access of all Models",
  //   `Credits will expire in ${process.env.NEXT_PUBLIC_CREDIT_EXPIRY} days`
  // ];
  const getFeatures = (item) => {
    const features = [];

    // Only add photo credits if not free plan or if it has credits
    if (item.name !== "free" && (item.creditPoints - item.extraCreditPoints) > 0) {
      features.push(`${item.creditPoints - item.extraCreditPoints} Photo Credits`);
    }

    // Add extra credits if applicable
    if (item.extraCreditPoints != 0) {
     
      features.push(`+${item.extraCreditPoints} Credits Extra`);
    }
    if (item.name === "free") {
      features.push("Free access of 3 models");
      features.push("History not accessible");
      features.push("Daily limit of 5 credits");
      features.push("Watermark on all images");
      features.push("No Storage");
    } else {
      features.push(`Storage: ${item.storage}`);
    }
    features.push(item.name === "free" ? "Limited access of models" : "Access of all Models");

    // Only add expiry info for non-free plans
    if (item.name !== "free") {
      features.push(`Credits will expire in ${process.env.NEXT_PUBLIC_CREDIT_EXPIRY} days`);
      features.push("No watermark on images");
    }

    return features;
  };

  return (
    <div className={styles.creditCardPlan}>
      <div className={styles.cardTitle}  >
        <h2 className={styles.mainTitle} style={{ marginTop: matches ? '0px' : '50px' }}>
          Credit <span className={styles.accentText}>Plans</span>
        </h2>
        <Typography
          component="div"
          className={styles.subtitle}
        >
          Whether you're an individual looking to enhance your photos, or a
          business seeking comprehensive image solutions,
          our pricing options
          are designed to accommodate your specific needs.
        </Typography>
      </div>

      <div className={styles.cardContainer}>
        {priceDetails.map((item, idx) => {
          const badge = getPlanBadge(item.name);
          const features = getFeatures(item);
          const isPopular = item.name === "popular";

          return (
            <div
              key={idx}
              className={`${styles.card} ${isPopular ? styles.popularCard : ''}`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Badge */}
              <div
                className={styles.planBadge}
                style={{ backgroundColor: badge.color }}
              >
                {badge.label}
              </div>

              {/* Price */}
              <div className={styles.priceSection}>
                <span className={styles.currency}>
                  {item.country === "IN" ? "₹" : "$"}
                </span>
                <span className={styles.price}>{item.price}</span>
              </div>

              {/* Description */}
              <p className={styles.planDescription}>
                Perfect for {item.name === 'free' ? 'indivisual getting started' : item.name === 'standard' ? 'individuals getting started' : item.name === 'popular' ? 'professionals and businesses' : 'power users and agencies'} with comprehensive image editing needs.
              </p>

              {/* Features */}
              <ul className={styles.featuresList}>
                {features.map((feature, featureIdx) => (
                  <li key={featureIdx} className={styles.featureItem}>
                    <svg className={styles.checkIcon} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                className={styles.ctaButton}
                onClick={() => successPaymentHandler(item.price)}
              >
                {item.name === "free" ? "Try Now" : "Click here to get started"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CreditPlanCard;






























