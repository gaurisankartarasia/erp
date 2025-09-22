

import { models } from '../models/index.js';
import { Op } from 'sequelize';
import { calculateSalaryBreakdown } from './SalaryController.js';

const { Employee, Attendance, LeaveRequest, LeaveType, SalaryComponent, EmployeeSalaryStructure, PayrollReport, SalarySlip } = models;

export const getPayrollPreviewData = async (req, res) => {
    const { month, year } = req.body;

    try {
        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month, 0));
        const totalDaysInMonth = endDate.getUTCDate();

        const [activeEmployees, allAttendanceForMonth, allApprovedLeavesForMonth] = await Promise.all([
            Employee.findAll({ where: { is_active: true }, attributes: ['id', 'name'] }),
            Attendance.findAll({ where: { date: { [Op.between]: [startDate, endDate] } } }),
            LeaveRequest.findAll({
                where: { status: 'approved', start_date: { [Op.lte]: endDate }, end_date: { [Op.gte]: startDate } },
                include: { model: LeaveType, as: 'LeaveType' }
            })
        ]);

        const previewData = [];

        for (const employee of activeEmployees) {
            const baseStructureResult = await calculateSalaryBreakdown(employee.id);

            if (baseStructureResult.error) {
                previewData.push({
                    employee_id: employee.id,
                    employee_name: employee.name,
                    error: 'No salary structure defined.',
                });
                continue;
            }

            const employeeAttendance = allAttendanceForMonth.filter(a => a.employee_id === employee.id);
            const employeeLeaves = allApprovedLeavesForMonth.filter(l => l.employee_id === employee.id);
            let presentDays = 0;
            let paidLeaveDays = 0;
            let unpaidLeaveDays = 0;
            const processedDates = new Set();

            employeeAttendance.forEach(att => {
                const dateStr = att.date;
                if (!processedDates.has(dateStr)) {
                    processedDates.add(dateStr);
                    presentDays++;
                }
            });

            employeeLeaves.forEach(leave => {
                let currentDate = new Date(leave.start_date);
                const leaveEndDate = new Date(leave.end_date);
                while (currentDate <= leaveEndDate) {
                    if (currentDate >= startDate && currentDate <= endDate) {
                        const dateStr = currentDate.toISOString().split('T')[0];
                        if (!processedDates.has(dateStr)) {
                           if (leave.LeaveType.is_unpaid) { unpaidLeaveDays++; } 
                           else { paidLeaveDays++; }
                        }
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            });
            const totalPayableDays = presentDays + paidLeaveDays;


            const finalEarnings = [];
            const finalDeductions = [];
            let totalFinalEarnings = 0;
            let totalFinalDeductions = 0;

            for (const component of baseStructureResult.breakdown) {
                let finalAmount = component.amount;
                if (component.is_days) {
                    finalAmount = (component.amount / totalDaysInMonth) * totalPayableDays;
                }
                finalAmount = parseFloat(finalAmount.toFixed(2));

                const detail = { name: component.name, amount: finalAmount };

                if (component.type === 'Earning') { 
                    finalEarnings.push(detail);
                    totalFinalEarnings += finalAmount;
                } else {
                    finalDeductions.push(detail);
                    totalFinalDeductions += finalAmount;
                }
            }

            const finalNetSalary = totalFinalEarnings - totalFinalDeductions;
            
            previewData.push({
                employee_id: employee.id,
                employee_name: employee.name,

                attendance_summary: { totalDaysInMonth, present_days: presentDays, paid_leave_days: paidLeaveDays, unpaid_leave_days: totalDaysInMonth - totalPayableDays },
                base_earnings: finalEarnings,
                base_deductions: finalDeductions,
                total_base_earnings: parseFloat(totalFinalEarnings.toFixed(2)),
                total_base_deductions: parseFloat(totalFinalDeductions.toFixed(2)),
                base_net_salary: parseFloat(finalNetSalary.toFixed(2))
            });
        }
        
        res.status(200).json(previewData);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching payroll preview data.', error: error.message });
    }
};

const runPayrollGeneration = async (reportId, month, year) => {
    console.log(`Starting payroll generation for report ID: ${reportId} (${month}/${year})`);
    
    try {
        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month, 0));
        const totalDaysInMonth = endDate.getUTCDate();

        const [activeEmployees, allAttendanceForMonth, allApprovedLeavesForMonth] = await Promise.all([
            Employee.findAll({ where: { is_active: true }, attributes: ['id', 'name'] }),
            Attendance.findAll({ where: { date: { [Op.between]: [startDate, endDate] }, check_in_time: { [Op.ne]: null } } }),
            LeaveRequest.findAll({ where: { status: 'approved', start_date: { [Op.lte]: endDate }, end_date: { [Op.gte]: startDate } }, include: { model: LeaveType, as: 'LeaveType' } })
        ]);
        
        const salarySlipsToCreate = [];
        for (const employee of activeEmployees) {
            const baseStructureResult = await calculateSalaryBreakdown(employee.id);

            if (baseStructureResult.error) {
                console.log(`Skipping employee ID ${employee.id} (${employee.name}): ${baseStructureResult.error}`);
                continue;
            }

            const employeeAttendance = allAttendanceForMonth.filter(a => a.employee_id === employee.id);
            const employeeLeaves = allApprovedLeavesForMonth.filter(l => l.employee_id === employee.id);
            const processedDates = new Set();
            let presentDaysCount = 0;
            let paidLeaveDaysCount = 0;

            employeeAttendance.forEach(att => {
                const dateStr = att.date;
                if (!processedDates.has(dateStr)) {
                    processedDates.add(dateStr);
                    presentDaysCount++;
                }
            });
            employeeLeaves.forEach(leave => {
                let currentDate = new Date(leave.start_date);
                const leaveEndDate = new Date(leave.end_date);
                while (currentDate <= leaveEndDate) {
                    if (currentDate >= startDate && currentDate <= endDate) {
                        const dateStr = currentDate.toISOString().split('T')[0];
                        if (!processedDates.has(dateStr) && !leave.LeaveType.is_unpaid) {
                            processedDates.add(dateStr);
                            paidLeaveDaysCount++;
                        }
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            });
            const totalPayableDays = presentDaysCount + paidLeaveDaysCount;

            const finalBreakdown = [];
            let totalFinalEarnings = 0;
            let totalFinalDeductions = 0;

            for (const component of baseStructureResult.breakdown) {
                let finalAmount = component.amount;

                if (component.is_days) {
                    finalAmount = (component.amount / totalDaysInMonth) * totalPayableDays;
                }
                
                finalAmount = parseFloat(finalAmount.toFixed(2));

                if (component.type === 'Earning') {
                    totalFinalEarnings += finalAmount;
                } else if (component.type === 'Deduction') {
                    totalFinalDeductions += finalAmount;
                }

                finalBreakdown.push({
                    name: component.name,
                    type: component.type,
                    amount: finalAmount
                });
            }

            const netSalary = totalFinalEarnings - totalFinalDeductions;
            
            salarySlipsToCreate.push({
                report_id: reportId,
                employee_id: employee.id,
                employee_name: employee.name,
                gross_earnings: parseFloat(totalFinalEarnings.toFixed(2)),
                total_payable_days: totalPayableDays,
                total_deductions: parseFloat(totalFinalDeductions.toFixed(2)),
                net_salary: parseFloat(netSalary.toFixed(2)),
                structure_breakdown: {
                    breakdown: finalBreakdown,
                    summary: {
                        totalEarnings: parseFloat(totalFinalEarnings.toFixed(2)),
                        totalDeductions: parseFloat(totalFinalDeductions.toFixed(2)),
                        netSalary: parseFloat(netSalary.toFixed(2))
                    }
                }, 
                attendance_breakdown: {
                    presentDays: presentDaysCount,
                    paidLeaveDays: paidLeaveDaysCount,
                    unpaidDays: totalDaysInMonth - totalPayableDays
                }
            });
        }
        
        if (salarySlipsToCreate.length > 0) {
            await SalarySlip.bulkCreate(salarySlipsToCreate);
        }

        await PayrollReport.update(
            { status: 'completed', generated_at: new Date() },
            { where: { id: reportId } }
        );
        console.log(`Successfully completed payroll generation for report ID: ${reportId}`);

    } catch (error) {
        console.error(`Payroll generation FAILED for report ID: ${reportId}. Error: ${error.message}`);
        await PayrollReport.update(
            { status: 'failed', error_log: error.message },
            { where: { id: reportId } }
        );
    }
};




export const initiatePayrollGeneration = async (req, res) => {
    const { month, year } = req.body;
    const { id: userId } = req.user;

    try {
        const existingReport = await PayrollReport.findOne({ where: { month, year, status: ['completed', 'processing'] } });
        if (existingReport) {
            return res.status(409).json({ message: `A report for ${month}/${year} is already completed or currently processing.`, reportId: existingReport.id });
        }

        const newReport = await PayrollReport.create({ month, year, generated_by_id: userId, status: 'processing' });
        
        res.status(202).json({ message: 'Payroll generation initiated.', reportId: newReport.id });

        runPayrollGeneration(newReport.id, month, year);

    } catch (error) {
        res.status(500).json({ message: 'Failed to initiate payroll generation.', error: error.message });
    }
};

export const getReportStatus = async (req, res) => {
    const { reportId } = req.params;
    try {
        const report = await PayrollReport.findByPk(reportId, { attributes: ['id', 'status', 'error_log'] });
        if (!report) return res.status(404).json({ message: 'Report not found.' });
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching report status.' });
    }
};


export const getPayrollReport = async (req, res) => {
    const { reportId } = req.params;
    try {
        const report = await PayrollReport.findByPk(reportId, {
            include: [
                { model: SalarySlip, as: 'SalarySlips' },
                { model: Employee, attributes: ['name'] }
            ]
        });
        if (!report) return res.status(404).json({ message: 'Report not found.' });
        if (report.status !== 'completed') return res.status(400).json({ message: 'Report is still processing or has failed.' });

        // --- ADD THE FOLLOWING LOGIC HERE ---

        // Create a mutable copy of the report to modify
        const reportJSON = report.toJSON();

        // Map over the SalarySlips to inject parent data
        reportJSON.SalarySlips = reportJSON.SalarySlips.map(slip => {
            return {
                ...slip, // Keep all original slip data
                month: report.month, // Add month from parent
                year: report.year,   // Add year from parent
                generated_at: report.generated_at // Add generated_at from parent
            };
        });

        // Send the modified report object instead of the original one
        res.status(200).json(reportJSON);
        
        // --- END OF NEW LOGIC ---

    } catch (error) {
        res.status(500).json({ message: 'Error fetching payroll report.', error: error.message });
    }
};

export const getRecentReports = async (req, res) => {
    try {
        const reports = await PayrollReport.findAll({
            order: [['year', 'DESC'], ['month', 'DESC']],
            limit: 12 
        });
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recent reports.' });
    }
};