import { useEffect, useState } from "react";

function Product_Card({ product, Height }){
    
    const [avgReviewCount, setAvgReviewCount] = useState(0);

    useEffect(() => {
        const count = GetAvgRating(product.ratingAndReviews);
        setAvgReviewCount(count);
    }, [product]);

    return (
        <div>
            <Link to={`/products/${product._id}`}>
                <div>
                    <div>
                        <img src={product?.thumbnail || product?.thumbnailImage}
                            alt="Product Thumbnail"
                            className={`${Height} w-[600px] p-5 rounded-xl object-cover`}
                        />
                    </div>
                    <div className="flex flex-col gap-2 px-1 py-3 bg-gray-800 rounded-b-3xl pl-5">
                        <p className="text-sm md:text-xl text-gray-700 bg-white mr-4 text-center rounded-md font-semibold">
                            {product?.productName}
                        </p>
                        <p className="p-[12px] md:text-xl text-[#F1F2FF]">
                            By <span className="text"> {product?.admin?.name}</span>
                        </p>
                        <div className="flex gap-x-3 items-center">
                            <span className="text">{avgReviewCount}</span>
                            <RatingStars Review_Count={avgReviewCount.length}/>
                            <span className="md:block hidden md:text-xl">Ratings</span>
                        </div>
                        <p className="text-sm md:text-xl"><span className="text">Rs. </span>{product?.price}</p>
                    </div>
                </div>
            </Link>
        </div>
    )
}

export {
    Product_Card
}