// import React from "react";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { cn } from "@/lib/utils";

// const FormInput = ({
//   label,
//   placeholder,
//   value,
//   onChange,
//   onBlur,
//   required = false,
//   type = "text",
//   error,
//   maxLength,
// }) => {
//   const handleKeyDown = (e) => {
//     if (
//       type === "tel" &&
//       !/[0-9]/.test(e.key) &&
//       e.key !== "Backspace" &&
//       e.key !== "ArrowLeft" &&
//       e.key !== "ArrowRight" &&
//       e.key !== "Tab"
//     ) {
//       e.preventDefault();
//     }
//   };

//   return (
//     <div className="w-full">
//       <div className="flex justify-between items-center mb-1">
//         <Label className="text-sm font-medium">{label}{required && <span className="text-red-500">*</span>}</Label>
//         {maxLength && (
//           <p
//             className={cn(
//               "text-xs",
//               value.length >= maxLength ? "text-red-500" : "text-gray-500"
//             )}
//           >
//             {value.length}/{maxLength}
//           </p>
//         )}
//       </div>

//       <Input
//         type={type}
//         value={value}
//         placeholder={placeholder}
//         onChange={onChange}
//         onBlur={onBlur}
//         onKeyDown={handleKeyDown}
//         maxLength={maxLength ?? (type === "tel" ? 10 : undefined)}
//         className={cn(error ? "border-red-500" : "")}
//       />

//       {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
//     </div>
//   );
// };

// export default FormInput;


import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const FormInput = ({
  name,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  required = false,
  type = "text",
  error,
  maxLength,
  rows,
}) => {
  const handleKeyDown = (e) => {
    if (
      type === "tel" &&
      !/[0-9]/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "Tab"
    ) {
      e.preventDefault();
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {maxLength && (
          <p
            className={cn(
              "text-xs",
              value.length >= maxLength ? "text-red-500" : "text-gray-500"
            )}
          >
            {value.length}/{maxLength}
          </p>
        )}
      </div>

      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          rows={rows || 3}
          maxLength={maxLength}
          className={cn(
            "w-full border rounded-md px-3 py-2 text-sm",
            error ? "border-red-500" : ""
          )}
        />
      ) : (
        <Input
          name={name} 
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          maxLength={maxLength ?? (type === "tel" ? 10 : undefined)}
          className={cn(error ? "border-red-500" : "")}
        />
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};


export default FormInput;
