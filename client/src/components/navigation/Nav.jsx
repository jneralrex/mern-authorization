import React from "react";
import { useSelector } from "react-redux";
import { Link, Outlet } from "react-router-dom";

const Nav = () => { 
  const {currentUser} = useSelector((state)=> state.user)
  return (
    <>
      {/* <div className="bg-slate-950 w-full text-white text-center grid grid-cols-2 justify-between p-2">
        <div className="text-left m-1">Auth App</div>
        <ul className="grid grid-cols-3 m-1">
         <Link to='home'><li>Home</li></Link>
         <Link to='about'><li>About</li></Link>
         {currentUser ? (
         <Link to='/nav/profile'>
          <img src={currentUser.profilePhoto} alt="profile picture" className="rounded-full object-cover h-7 w-7" />
         </Link>
         ):
         (<li><Link to={'/sign-in'}>Sign-in </Link></li>
         )}
        </ul>
      </div> */}
       <header className="bg-blue-600 text-white py-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">LoveConnect FYP</h1>
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
