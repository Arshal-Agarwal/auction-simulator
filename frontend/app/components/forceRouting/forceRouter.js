"use client"
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'


function ForceRouter() {
  const router = useRouter();
  useEffect(()=>{
    router.push('/pages/home');
  })
  return (
    <div>
      
    </div>
  )
}

export default ForceRouter
