import React from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaGoogle, FaTwitter, FaYoutube, FaFacebook } from "react-icons/fa";
import { SlLocationPin } from "react-icons/sl";

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
                    <h1>
                        Policy
                    </h1>
                    <div>
                        {Policy.map((ele, i) => {
                            return (
                                <div className="" key={i}>
                                    <Link to={ele.split(' ').join('-').toLowerCase()}>{ele}</Link>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div>
                    <h1>Help</h1>
                    <div>
                        {Help.map((ele, i) => {
                            return (
                                <div className="" key={i}>
                                    <Link to={ele.split(' ').join('-').toLowerCase()}>{ele}</Link>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div>
                    <h1>
                        About
                    </h1>
                    <div>
                        {About.map((ele, i) => {
                            return (
                                <div className="" key={i}>
                                    <Link to={ele.split(' ').join('-').toLowerCase()}></Link>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            <div>
                <div>
                    <Link to={''}><FaFacebook/></Link>
                    <Link to={''}><FaGoogle/></Link>
                    <Link to={''}><FaTwitter/></Link>
                    <Link to={''}><FaYoutube/></Link>
                </div>
                <p>All rights are reserved ©</p>
            </div>
        </div>
    )
}

export {
    Footer
}