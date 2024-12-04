import React from "react";
import { useSelector } from "react-redux";
import { Link, Outlet } from "react-router-dom";

const Nav = () => { 
  const {currentUser} = useSelector((state)=> state.user)
  return (
    <>
       <header className="bg-blue-600 text-white py-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">LoveConnect</h1>
          <ul className="grid grid-cols-3 m-1">
         {currentUser ? (
         <Link to='/nav/profile'>
          <img src={currentUser.profilePhoto} alt="profile picture" className="rounded-full object-cover h-7 w-7" />
         </Link>
         ):
         (<li><Link to={'/sign-in'}>Sign-in </Link></li>
         )}
        </ul>
        </div>
      </header>
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default Nav;
