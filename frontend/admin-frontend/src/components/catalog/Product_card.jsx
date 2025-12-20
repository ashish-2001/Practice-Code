import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Product_Card({ product, height, width }){

    const [avgReviewCount, setAvgReviewCount] = useState(0);

    useEffect(() => {
        const count = GetAvgRating(product.ratingAndReview);
        setAvgReviewCount(count);
    }, [product]);

    return (
        <div>
            <Link to={`/products/${product._id}`}>
                <div>
                    <img 
                        src={product?.thumbnail || product?.thumbnailImage}
                        alt='Product thumbnail'
                        className={`${height} ${width}`}
                    />
                </div>
                <div>
                    <p></p>
                    <p></p>
                    <div>
                        <span>{avgReviewCount}</span>
                        <RatingStars/>
                        <span></span>
                    </div>
                    <p></p>
                </div>
            </Link>
        </div>
    )
}

export {
    Product_Card
}