import React from "react";
import Head from 'next/head'

function Header(props) {
    return (
        <Head>
            <title>Buy {props.name} a ~decentralized~ Coffee!</title>
            <meta name="description" content="Tipping site" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
    );
}

export default Header;