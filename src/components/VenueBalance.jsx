"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { useWallet } from "@/hooks/useWallet";

export default function VenueBalance() {
  const { contract, provider } = useWallet();
  const [sold, setSold] = useState(null);
  const [cap, setCap] = useState(null);

  useEffect(() => {
    (async () => {
      const read = contract.connect(provider);
      const s = await read.totalSupply();
      const c = await read.cap();
      setSold(Number(s));
      setCap(Number(c));
    })();
  }, [contract, provider]);

  return (
    <Card>
      <CardContent>
        <Typography>Tickets Sold</Typography>
        <Typography variant="h6">
          {sold !== null && cap !== null ? `${sold} / ${cap}` : "…"}
        </Typography>
      </CardContent>
    </Card>
  );
}
