import React from "react";
import { Link, Outlet } from "react-router-dom";

const Nav = () => {
  return (
    <>
      <div className="bg-slate-950 w-full text-white text-center grid grid-cols-2 justify-between p-2">
        <div className="text-left m-1">Auth App</div>
        <ul className="grid grid-cols-3 m-1">
         <Link to='home'><li>Home</li></Link>
         <Link to='profile'><li>profile</li></Link>
         <Link to='about'><li>About</li></Link>
        </ul>
      </div>
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default Nav;
