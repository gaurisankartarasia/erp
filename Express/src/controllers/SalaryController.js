import { Op } from 'sequelize';
import { models, sequelize  } from '../models/index.js';
const { SalaryComponent, EmployeeSalaryStructure, Employee } = models;

// const PAGE_NAME = 'SALARY COMPONENT';

// Validation function, similar to the reference
const validateSalaryComponent = (data) => {
  const errors = {};
  const name = data.name?.trim();
  const type = data.type;

  if (!name) errors.name = 'Component Name is required.';
  else if (name.length > 100) errors.name = 'Component Name must not exceed 100 characters.';

  if (!type || !['Earning', 'Deduction'].includes(type)) {
    errors.type = 'A valid Component Type (Earning/Deduction) is required.';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

// CREATE
export const createSalaryComponent = async (req, res) => {
  try {
    const validation = validateSalaryComponent(req.body);
    if (!validation.isValid) {
      return res.status(400).send({ message: 'Validation failed', errors: validation.errors });
    }

    const normalizedName = req.body.name.trim().replace(/\s+/g, ' ');
    const existingComponent = await SalaryComponent.findOne({ where: { name: normalizedName } });

    if (existingComponent) {
      return res.status(409).send({ message: 'A Salary Component with this name already exists.' });
    }

    const newComponent = await SalaryComponent.create({
      ...req.body,
      name: normalizedName,
    });

    res.status(201).send(newComponent);
  } catch (error) {
    res.status(500).send({ message: error.message || 'Error creating Salary Component.' });
  }
};

// READ ALL (with pagination, search, sort)
export const getSalaryComponents = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = (req.query.search || '').trim();

    let sortBy = req.query.sort || 'id'; 
    const sortOrder = req.query.order || 'ASC';


    const allowedSortColumns = ['id', 'name', 'type', 'status', 'createdAt', 'displayOrder'];
    
    // Changed the fallback sort column to 'id' as well.
    if (!allowedSortColumns.includes(sortBy)) {
      sortBy = 'id';
    }
    // --- FIX END ---

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { type: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await SalaryComponent.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limit,
      offset: offset,
    });

    // The backend response format (total, data) is correct for your frontend hook.
    return res.json({ total: count, data: rows });
    
  } catch (error) {
    // This will log the specific database error to your server console for easier debugging.
    console.error('Server Error in getSalaryComponents:', error); 
    return res.status(500).json({ message: 'Server error' });
  }
};
// READ ONE
export const getSalaryComponentById = async (req, res) => {
    const { id } = req.params;
    try {
        const component = await SalaryComponent.findByPk(id);
        if (component) {
            res.status(200).send(component);
        } else {
            res.status(404).send({ message: `Cannot find Salary Component with id=${id}.` });
        }
    } catch (error) {
        res.status(500).send({ message: `Error retrieving Salary Component with id=${id}.` });
    }
};

// UPDATE
export const updateSalaryComponent = async (req, res) => {
  const { id } = req.params;
  try {
    const component = await SalaryComponent.findByPk(id);
    if (!component) return res.status(404).send({ message: `Cannot find Salary Component with id=${id}.` });

    const validation = validateSalaryComponent(req.body);
    if (!validation.isValid) {
      return res.status(400).send({ message: 'Validation failed', errors: validation.errors });
    }

    if (req.body.name) {
      const normalizedName = req.body.name.trim().replace(/\s+/g, ' ');
      const existingComponent = await SalaryComponent.findOne({
        where: { name: normalizedName, id: { [Op.ne]: id } },
      });
      if (existingComponent) {
        return res.status(409).send({ message: 'Another Salary Component with this name already exists.' });
      }
      req.body.name = normalizedName;
    }

    await component.update(req.body);
    res.status(200).send(component);
  } catch (error) {
    res.status(500).send({ message: `Error updating Salary Component with id=${id}.` });
  }
};

// DELETE
export const deleteSalaryComponent = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await SalaryComponent.destroy({ where: { id: id } });
    if (deleted) {
      res.status(200).send({ message: 'Salary Component was deleted successfully!' });
    } else {
      res.status(404).send({ message: `Cannot find Salary Component with id=${id}.` });
    }
  } catch (error) {
    res.status(500).send({ message: `Could not delete Salary Component with id=${id}.` });
  }
};

// ------------------salary str.



export const getEmployeeList = async (req, res) => {
    try {
        const employees = await Employee.findAll({
            where: { is_active: true },
            attributes: ['id', 'name'],
            order: [['name', 'ASC']]
        });
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employee list.', error: error.message });
    }
};


export const calculateSalaryBreakdown = async (employeeId) => {
    const structureRules = await EmployeeSalaryStructure.findAll({
        where: { employee_id: employeeId },
        include: [{ model: SalaryComponent, as: 'component' }],
        raw: true,
        nest: true 
    });

    if (!structureRules || structureRules.length === 0) {
        return { error: `No salary structure defined for employee ID ${employeeId}.` };
    }

    const calculatedValues = new Map(); 
    const isCalculated = new Set();   
    let passes = 0;
    const maxPasses = structureRules.length; 

    while (isCalculated.size < structureRules.length && passes <= maxPasses) {
        let calculationsMadeInThisPass = false;

        for (const rule of structureRules) {
            if (isCalculated.has(rule.id)) {
                continue; 
            }

            if (rule.calculation_type === 'Flat') {
                calculatedValues.set(rule.component.id, parseFloat(rule.value));
                isCalculated.add(rule.id);
                calculationsMadeInThisPass = true;
            } else if (rule.calculation_type === 'Percentage') {
               const dependencyIds = typeof rule.dependencies === 'string'
                    ? JSON.parse(rule.dependencies)
                    : (rule.dependencies || []);
                
                const areDependenciesMet = dependencyIds.every(depId => calculatedValues.has(depId));
                
                if (areDependenciesMet) {
                    const baseSum = dependencyIds.reduce((sum, depId) => sum + calculatedValues.get(depId), 0);
                    const calculatedAmount = (baseSum * parseFloat(rule.value)) / 100;
                    
                    calculatedValues.set(rule.component.id, calculatedAmount);
                    isCalculated.add(rule.id);
                    calculationsMadeInThisPass = true;
                }
            }
        }
        
        if (!calculationsMadeInThisPass) {
            break;
        }
        passes++;
    }

    if (isCalculated.size < structureRules.length) {
        const uncalculated = structureRules.filter(r => !isCalculated.has(r.id)).map(r => r.component.name);
        throw new Error(`Could not resolve salary structure. Circular dependency or missing base value detected. Uncalculated components: ${uncalculated.join(', ')}`);
    }

    const breakdown = [];
    let totalEarnings = 0;
    let totalDeductions = 0;

    structureRules.forEach(rule => {
        const amount = calculatedValues.get(rule.component.id);
        breakdown.push({
            name: rule.component.name,
            type: rule.component.type,
            amount: parseFloat(amount.toFixed(2)),
            is_days: rule.component.is_days_based
        });

        if (rule.component.type === 'Earning') {
            totalEarnings += amount;
        } else if (rule.component.type === 'Deduction') {
            totalDeductions += amount;
        }
    });

    return {
        employee_id: employeeId,
        breakdown,
        summary: {
            totalEarnings: parseFloat(totalEarnings.toFixed(2)),
            totalDeductions: parseFloat(totalDeductions.toFixed(2)),
            netSalary: parseFloat((totalEarnings - totalDeductions).toFixed(2))
        }
    };
};

export const getEmployeeSalaryStructure = async (req, res) => {
    const { employeeId } = req.params;
    try {
        const structure = await EmployeeSalaryStructure.findAll({
            where: { employee_id: employeeId },
            include: [{ model: SalaryComponent, as: 'component' }]
        });
        res.status(200).json(structure);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employee salary structure.', error: error.message });
    }
};

export const updateEmployeeSalaryStructure = async (req, res) => {
    const { employeeId } = req.params;
    const structureRules = req.body;

    if (!Array.isArray(structureRules)) {
        return res.status(400).json({ message: 'Request body must be an array of salary structure rules.' });
    }

    const t = await sequelize.transaction();
    try {
        await EmployeeSalaryStructure.destroy({
            where: { employee_id: employeeId },
            transaction: t
        });

        const newRules = structureRules.map(rule => ({
            employee_id: employeeId,
            component_id: rule.component_id,
            calculation_type: rule.calculation_type,
            value: rule.value,
            dependencies: rule.calculation_type === 'Percentage' ? rule.dependencies : null,
        }));
        
        if (newRules.length > 0) {
            await EmployeeSalaryStructure.bulkCreate(newRules, {
                transaction: t,
                validate: true 
            });
        }
        
        await t.commit();
        res.status(200).json({ message: "Employee's salary structure updated successfully." });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Error updating employee salary structure.', error: error.message });
    }
};