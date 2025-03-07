import React from "react";
import RainbowKitAndChakraProvider from "./RainbowKitAndChakraProvider";
import { Inter } from "next/font/google";
// import Layout from "@/components/Layout.jsx";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RainbowKitAndChakraProvider>
          {/* <Layout> */}
            {children}
          {/* </Layout> */}
        </RainbowKitAndChakraProvider>
      </body>
    </html>
  );
}
