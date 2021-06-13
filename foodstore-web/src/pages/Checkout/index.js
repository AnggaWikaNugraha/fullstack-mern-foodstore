import * as React from "react";
import TopBar from "../../component/Topbar";
import FaCartPlus from "@meronex/icons/fa/FaCartPlus";
import FaAddressCard from "@meronex/icons/fa/FaAddressCard";
import FaInfoCircle from "@meronex/icons/fa/FaInfoCircle";

import { LayoutOne, Text, Steps } from "upkit";

const IconWrapper = ({ children }) => {
  return <div className="text-3xl flex justify-center">{children}</div>;
};

const steps = [
  {
    label: "Item",
    icon: (
      <IconWrapper>
        <FaCartPlus />
      </IconWrapper>
    ),
  },
  {
    label: "Alamat",
    icon: (
      <IconWrapper>
        <FaAddressCard />
      </IconWrapper>
    ),
  },
  {
    label: "Konfirmasi",
    icon: (
      <IconWrapper>
        <FaInfoCircle />
      </IconWrapper>
    ),
  },
];

export default function Checkout() {
  let [activeStep, setActiveStep] = React.useState(0);

  return (
    <LayoutOne>
      <TopBar />
      <Text as="h3"> Checkout </Text>
      <Steps steps={steps} active={activeStep}></Steps>

      <button onClick={(_) => setActiveStep(0)}> ke langkah pertama </button>
      <button onClick={(_) => setActiveStep(1)}> ke langkah kedua </button>
      <button onClick={(_) => setActiveStep(2)}> ke langkah ketiga </button>

      <br />
      <br />

      <button onClick={(_) => setActiveStep(activeStep - 1)}>
        {" "}
        ke langkah sebelumnya{" "}
      </button>
      <button onClick={(_) => setActiveStep(activeStep + 1)}>
        {" "}
        ke langkah berikutnya{" "}
      </button>

      {activeStep === 0 ? <div> Langkah pertama </div> : null}

      {activeStep == 1 ? <div> Langkah kedua </div> : null}

      {activeStep == 2 ? <div> Langkah ketiga </div> : null}
    </LayoutOne>
  );
}
