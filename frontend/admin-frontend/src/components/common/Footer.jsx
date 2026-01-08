import React from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaGoogle, FaTwitter, FaYoutube, FaFacebook } from "react-icons/fa";
import { SlLocationPin } from "react-icons/sl";
import { FooterLink, SocialMediaLinks } from "./data/Footerlink";

const Policy = ['Shipping & Delivery Policy', 'Return & Exchange Policy', 'Payment Policy', 'Grievance Redressal Policy'];
const Help = ['FAQs', 'Contact Us', 'terms of Service', 'Privacy Policy', 'Track Order', 'Return & Exchange']
const About = ['About Us', 'Blogs', 'Contact Us', 'Stores & Services']


function Footer(){

    return (
        <div className="">
            <div>
                <div>
                    <h1> <SlLocationPin/> Registered Address</h1>
                    <h1>
                        DEMIFINE FASHION PVT LTD
                    </h1>
                    <p>
                        <p>Office No<br>123034940(A) 1st floor. <br> Junabganj, Banthara, Lucknow(226401)</br></br></p>
                    </p>
                </div>
                <div>
                    {FooterLink.map((ele, i) => (
                        <div key={i}>
                            <h1>
                                {ele.title}
                            </h1>
                            <div>
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
        </div>
    )
}

export {
    Footer
}