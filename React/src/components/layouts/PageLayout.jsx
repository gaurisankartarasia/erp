import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PageLayout({ title, rightButton, children }) {
  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-center mb-6">
        {title && <h1 className="text-xl font-semibold">{title}</h1>}
        {rightButton && (
          <Link to={rightButton.path}>
            <Button>{rightButton.text}</Button>
          </Link>
        )}
      </div>

      <div>{children}</div>
    </div>
  );
}
