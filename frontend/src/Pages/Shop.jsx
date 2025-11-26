import React from 'react'
import { Hero } from '../Components/Hero/Hero'
import { Popular } from '../Components/Popular/Popular'
import { NewCollections } from '../Components/NewCollections/NewCollections'
import { Helmet } from "react-helmet-async";

export const Shop = () => {

  return (
    <div>
      <Helmet>
        <title>SHOP │ Modern Fashion Online Store</title>
        <meta name="description" content="Meet the trendy new fashions for women and men. Get weekly updates on popular deals." />
      </Helmet>
      <Hero/>
      <Popular/>
      <NewCollections/>
    </div>
  )
}
