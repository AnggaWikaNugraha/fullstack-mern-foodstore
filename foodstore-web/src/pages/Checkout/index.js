import * as React from "react";
import TopBar from "../../component/Topbar";

import { LayoutOne, Text } from "upkit";

export default function Checkout() {
  return (
    <LayoutOne>
      <TopBar />
      <Text as="h3"> Checkout </Text>
    </LayoutOne>
  );
}
