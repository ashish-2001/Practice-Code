function Product_Slider({ products }){

    return (
        <>
        {
            products?.length ? (
                <Swiper mousewheel={
                    {
                        enabled: true,
                        forceToAxis: true
                    }
                }
                keyboard={
                    {
                        enabled: true,
                        onlyInViewport: true
                    }
                }
                allowSlidePrev={true}
                slidesPerView={1}
                spaceBetween={20}
                pagination={true}
                loop={true}
                modules={[Pagination, Navigation, FreeMode, MouseWheel, Keyboard]}
                breakpoints={{
                    300: { slidesPerView: 2.1, spaceBetween: 10},
                    640: { slidesPerView: 2.2},
                    1024: { slidesPerView: 3.1}
                }}
                className="max-h-[30rem]">
                    {products?.map((course, index) => (
                        <SwiperSlide key={index}>
                            <Product_Card course={course} Height={"lg:h-[250px] h-[100px]"}/>
                        </SwiperSlide>
                    ))}
                </Swiper>
            ) : (
                <div className="flex gap-4 overflow-hidden">
                    
                </div>
            )
        }
        </>
    )
}