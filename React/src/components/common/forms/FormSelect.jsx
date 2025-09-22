// import React from "react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// /**
//  * Reusable Select Component
//  *
//  * @param {string} value - Currently selected value
//  * @param {function} onChange - Callback when value changes
//  * @param {string} placeholder - Placeholder text
//  * @param {Array} options - Array of { label, value } for dropdown
//  * @param {string} className - Extra class for styling
//  */
// const FormSelect = ({
//   value,
//   onChange,
//   placeholder = "Select an option",
//   options = [],
//   className = "",
// }) => {
//   return (
//     <Select value={value} onValueChange={onChange}>
//       <SelectTrigger className={`w-full ${className}`}>
//         <SelectValue placeholder={placeholder} />
//       </SelectTrigger>
//       <SelectContent>
//         {options.map((option) => (
//           <SelectItem key={option.value} value={option.value}>
//             {option.label}
//           </SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//   );
// };

// export default FormSelect;


import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const FormSelect = ({
  name,
  label,
  placeholder,
  value,
  onValueChange,
  options,
  required = false,
  error,
}) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Select name={name} value={value} onValueChange={onValueChange}>
        <SelectTrigger className={cn(error && "border-destructive")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default FormSelect;