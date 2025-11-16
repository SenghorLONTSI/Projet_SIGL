import React from "react";
import { Alert, AlertTitle } from "@/components/ui/alert";
const Unauthorized = () => {
  return (
    <div>
      <Alert>
        <AlertTitle>Unauthorized</AlertTitle>
        <p>Désole tu ne peux pas.</p>
      </Alert>
    </div>
  );
};

export default Unauthorized;
