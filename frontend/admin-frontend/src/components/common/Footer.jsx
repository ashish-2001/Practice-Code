import React from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaGoogle, FaTwitter, FaYoutube, FaFacebook } from "react-icons/fa";
import { SlLocationPin } from "react-icons/sl";
import { FooterLink, PopularSearchesLinks, SocialMediaLinks } from "./data/Footerlink";

function Footer(){

    return (
        <div className="">
            <div className="flex flex-col">
                <div>
                    <h1> <SlLocationPin/> Registered Address</h1>
                    <h1>
                        DEMIFINE FASHION PVT LTD
                    </h1>
                    <p>
                        <p>Office No<br>123034940(A) 1st floor. <br> Junabganj, Banthara, Lucknow(226401)</br></br></p>
                    </p>
                </div>
                <div className="flex">
                    {FooterLink.map((ele, i) => (
                        <div key={i}c className="flex flex-col">
                            <h1>
                                {ele.title}
                            </h1>
                            <div className="flex flex-col">
                                {ele.links.map((link, i) => (
                                    <div key={i}>
                                        <Link to={link.link}>{link.title}</Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex flex-col">
                <div className="flex">
                    {SocialMediaLinks.map((ele, i) => (
                        <div key={i}>
                            <Link to={ele.link}>{ele.logo}</Link>
                        </div>
                    ))}
                </div>
                <p>All rights are reserved ©</p>
            </div>

            <div> Popular Searches
                {PopularSearchesLinks.map((ele, i) => (
                    <div className="" key={i} >
                        <h1>{ele.title}</h1>
                        <Link to={ele.links.link}>{ele.links.link} { i !== i.length() - 1 && '|'} </Link>
                        <hr/>
                    </div>
                )) }
            </div>
        </div>
    )
}

export {
    Footer
}