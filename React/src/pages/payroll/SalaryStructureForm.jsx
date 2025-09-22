import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronsUpDown } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import FormLayout from "@/components/layouts/FormLayout";
import axios from "axios";

const SalaryStructureForm = ({ employeeId, masterComponents }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedTotals, setCalculatedTotals] = useState({
    totalEarnings: 0,
    totalDeductions: 0,
    netSalary: 0,
    calculatedValues: new Map(),
  });

  const { handleSubmit, watch, setValue, getValues } = useForm({
    defaultValues: {
      structure: [],
    },
  });

  const structure = watch("structure");

  useEffect(() => {
    const fetchStructure = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/salary/structure/${employeeId}`
        );
        const existingStructure = response.data;

        const formattedStructure = existingStructure.map((rule) => ({
          ...rule,
          dependencies:
            typeof rule.dependencies === "string"
              ? JSON.parse(rule.dependencies)
              : rule.dependencies || [],
        }));
        setValue("structure", formattedStructure);
      } catch (error) {
        toast.error("Failed to load existing salary structure.", {
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStructure();
  }, [employeeId, setValue]);

  useEffect(() => {
    const calculate = () => {
      const calculatedValues = new Map();
      let totalEarnings = 0,
        totalDeductions = 0;
      const currentStructure = structure || [];
      let passes = 0;
      const maxPasses = currentStructure.length;

      while (
        calculatedValues.size < currentStructure.length &&
        passes <= maxPasses
      ) {
        currentStructure.forEach((rule) => {
          if (calculatedValues.has(rule.component_id)) return;

          if (rule.calculation_type === "Flat") {
            calculatedValues.set(
              rule.component_id,
              parseFloat(rule.value || 0)
            );
          } else if (rule.calculation_type === "Percentage") {
            const dependencyIds = rule.dependencies || [];
            const areDepsMet = dependencyIds.every((depId) =>
              calculatedValues.has(depId)
            );

            if (areDepsMet) {
              const baseSum = dependencyIds.reduce(
                (sum, depId) => sum + (calculatedValues.get(depId) || 0),
                0
              );
              const calculatedAmount =
                (baseSum * parseFloat(rule.value || 0)) / 100;
              calculatedValues.set(rule.component_id, calculatedAmount);
            }
          }
        });
        passes++;
      }

      currentStructure.forEach((rule) => {
        const component = masterComponents.find(
          (c) => c.id === rule.component_id
        );
        const amount = calculatedValues.get(rule.component_id) || 0;
        if (component?.type === "Earning") totalEarnings += amount;
        else if (component?.type === "Deduction") totalDeductions += amount;
      });

      setCalculatedTotals({
        totalEarnings,
        totalDeductions,
        netSalary: totalEarnings - totalDeductions,
        calculatedValues,
      });
    };
    calculate();
  }, [structure, masterComponents]);

  const handleComponentToggle = (checked, component) => {
    const currentStructure = getValues("structure");
    if (checked) {
      setValue("structure", [
        ...currentStructure,
        {
          component_id: component.id,
          calculation_type: "Flat",
          value: 0,
          dependencies: [],
        },
      ]);
    } else {
      setValue(
        "structure",
        currentStructure.filter((rule) => rule.component_id !== component.id)
      );
    }
  };

  const updateRuleField = (ruleIndex, field, value) => {
    const updatedStructure = [...getValues("structure")];
    updatedStructure[ruleIndex][field] = value;
    setValue("structure", updatedStructure);
  };

  const onFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/salary/structure/${employeeId}`,
        data.structure
      );
      toast.success("Salary structure saved successfully!");
    } catch (error) {
      toast.error("Failed to save structure.", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner />
      </div>
    );
  }

  return (
    <FormLayout
      headerText={`Define Salary Structure for Employee ID: ${employeeId}`}
      onSubmit={handleSubmit(onFormSubmit)}
      submitText={isSubmitting ? "Saving..." : "Save Structure"}
      showSubmit={true}
    >
      <div className="overflow-x-auto border rounded-lg">
        <Table className="min-w-full whitespace-nowrap">
          <TableHeader>
            <TableRow>
              <TableHead>Include</TableHead>
              <TableHead>Component</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Calc. Type</TableHead>
              <TableHead>Percentage Of</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="text-right">Amount (Preview)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {masterComponents.map((component) => {
              const ruleIndex = structure.findIndex(
                (r) => r.component_id === component.id
              );
              const isActive = ruleIndex !== -1;
              const rule = isActive ? structure[ruleIndex] : null;
              const calculatedAmount =
                calculatedTotals.calculatedValues.get(component.id) || 0;

              return (
                <TableRow key={component.id}>
                  <TableCell>
                    <Checkbox
                      checked={isActive}
                      onCheckedChange={(checked) =>
                        handleComponentToggle(checked, component)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {component.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        component.type === "Earning" ? "default" : "destructive"
                      }
                    >
                      {component.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isActive && rule ? (
                      <Select
                        value={rule.calculation_type}
                        onValueChange={(value) =>
                          updateRuleField(ruleIndex, "calculation_type", value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Flat">Flat</SelectItem>
                          <SelectItem value="Percentage">Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {isActive && rule?.calculation_type === "Percentage" ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-40 justify-between font-normal"
                          >
                            {rule.dependencies?.length > 0
                              ? `${rule.dependencies.length} selected`
                              : "Select..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-2 w-56">
                          <div className="space-y-1">
                            {masterComponents
                              .filter(
                                (c) =>
                                  c.type === "Earning" && c.id !== component.id
                              )
                              .map((c) => (
                                <div
                                  key={c.id}
                                  className="flex items-center space-x-2 p-1 rounded-md hover:bg-accent"
                                >
                                  <Checkbox
                                    id={`dep-${ruleIndex}-${c.id}`}
                                    checked={rule.dependencies?.includes(c.id)}
                                    onCheckedChange={(checked) => {
                                      const deps = rule.dependencies || [];
                                      const newDeps = checked
                                        ? [...deps, c.id]
                                        : deps.filter((id) => id !== c.id);
                                      updateRuleField(
                                        ruleIndex,
                                        "dependencies",
                                        newDeps
                                      );
                                    }}
                                  />
                                  <Label
                                    htmlFor={`dep-${ruleIndex}-${c.id}`}
                                    className="text-sm font-medium flex-1 cursor-pointer"
                                  >
                                    {c.name}
                                  </Label>
                                </div>
                              ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {isActive && rule ? (
                      <Input
                        type="number"
                        className="w-32"
                        step="0.01"
                        value={rule.value || ""}
                        onChange={(e) =>
                          updateRuleField(ruleIndex, "value", e.target.value)
                        }
                        placeholder={
                          rule.calculation_type === "Percentage"
                            ? "%"
                            : "Amount"
                        }
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {isActive ? `₹ ${calculatedAmount.toFixed(2)}` : "-"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Salary Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Total Earnings</TableCell>
                <TableCell className="text-right font-bold text-green-600">
                  ₹ {calculatedTotals.totalEarnings.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total Deductions</TableCell>
                <TableCell className="text-right font-bold text-red-600">
                  ₹ {calculatedTotals.totalDeductions.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow className="text-lg bg-slate-50">
                <TableCell className="font-semibold">Net Salary</TableCell>
                <TableCell className="text-right font-bold">
                  ₹ {calculatedTotals.netSalary.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </FormLayout>
  );
};

export default SalaryStructureForm;
