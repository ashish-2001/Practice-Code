import React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import { GiHamburgerMenu } from "react-icons/gi";
import { Link, matchPath, useLocation, useNavigate } from "react-router-dom";
import { IoSearch } from 'react-icons/io5';
import { IoIosHeartEmpty } from 'react-icons/Io';
import { CiUser } from 'react-icons/ci';
import { IoCartOutline } from "react-icons/io5";
import { NavbarLinks } from "./data/Navbarlinks";


function Navbar(){

    return (
        <div>
            <div>
                <Logo/>
            </div>
            <div className="flex">
                <input type="text" placeholder="Search bracelets"/>
                <IoSearch />
            </div>
            <div className="flex">
                <div>
                    <CiUser />
                </div>
                <div className="flex ">
                    <IoIosHeartEmpty />
                    <span></span>
                </div>
                <div className="flex">
                    <IoCartOutline />
                    <span></span>
                </div>
            </div>
            <div className="header-section-menu">
                <nav>
                    <ul>
                        {NavbarLinks?.map((ele, i) => (
                            <li key={i}>

                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    )
}

export {
    Navbar
}