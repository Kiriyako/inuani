"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const [searchValue, setSearchValue] = useState('');
  const router = useRouter();

  const handleInputChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/search/${searchValue}`);
  };

  return (
    <div id="navbarComp">
      <div id="navbar">
        <Link href="/">
          <div id="explore">
            <h1>Explore</h1>
          </div>
        </Link>
      </div>
      <div id="inputsearch">
        <form onSubmit={handleSearch}>
          <input
            className="dog"
            placeholder="Search"
            value={searchValue}
            onChange={handleInputChange}
            onSubmit={() => router.push(`/search/${searchValue}`)}
          />
        </form>
      </div>
    </div>
  );
}