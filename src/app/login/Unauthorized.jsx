import React from "react";
import { getUser } from "@/lib/auth-server";
import { unauthorized } from "next/navigation";
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
