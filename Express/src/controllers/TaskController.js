import {models} from '../models/index.js';
import asyncHandler from 'express-async-handler';
import { Op } from 'sequelize';

const { Task, Employee } = models

const createTask = asyncHandler(async (req, res) => {
  const { title, description, assigned_duration_minutes } = req.body;
  const employeeId = req.user.id;

  if (!title) {
    res.status(400);
    throw new Error('Title is required');
  }
  if (!assigned_duration_minutes || assigned_duration_minutes <= 0) {
      res.status(400);
      throw new Error('A valid estimated duration is required.');
  }

  const task = await Task.create({
    title,
    description,
    assigned_duration_minutes,
    EmployeeId: employeeId,
    status: 'pending',
  });

  res.status(201).json(task);
});

const getTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await Task.findByPk(id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (!req.user.is_master && task.EmployeeId !== req.user.id) {
    res.status(403);
    throw new Error('User not authorized to view this task');
  }

  res.status(200).json(task);
});

const getAvailableTasks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, sort = 'createdAt', order = 'DESC' } = req.query;
  const parsedLimit = parseInt(limit, 10);
  const offset = (parseInt(page, 10) - 1) * parsedLimit;

  let whereClause = {};

  if (search) {
    const searchPattern = `%${search}%`;
    whereClause[Op.or] = [
      { title: { [Op.like]: searchPattern } },
      { '$Employee.name$': { [Op.like]: searchPattern } },
    ];
  }

  const { count, rows } = await Task.findAndCountAll({
    where: whereClause,
    include: { model: Employee, attributes: ['name'] },
    order: [[sort, order]],
    limit: parsedLimit,
    offset,
  });

  res.status(200).json({
    data: rows,
    total: count,
  });
});

const getTaskHistories = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sort = 'actual_end_time', order = 'DESC' } = req.query;
    const parsedLimit = parseInt(limit, 10);
    const offset = (parseInt(page, 10) - 1) * parsedLimit;

    const whereClause = {
        EmployeeId: req.user.id,
        status: 'completed',
    };

    const { count, rows } = await Task.findAndCountAll({
        where: whereClause,
        include: { model: Employee, attributes: ['name'] },
        order: [[sort, order]],
        limit: parsedLimit,
        offset,
    });

    res.status(200).json({
        data: rows,
        total: count,
    });
});



const getMyActiveTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.findAll({
    where: {
      EmployeeId: req.user.id,
      status: { [Op.ne]: 'completed' },
    },
    include: { model: Employee, attributes: ['name'] },
    order: [['createdAt', 'DESC']],
  });

  res.status(200).json(tasks);
});


const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, assigned_duration_minutes } = req.body;
  const task = await Task.findByPk(id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  if (!req.user.is_master && task.EmployeeId !== req.user.id) {
    res.status(403);
    throw new Error('User not authorized to update this task');
  }
  if (task.status !== 'pending') {
    res.status(400);
    throw new Error('Only pending tasks can be edited');
  }

  task.title = title || task.title;
  task.description = description ?? task.description;
  task.assigned_duration_minutes = assigned_duration_minutes ?? task.assigned_duration_minutes;

  await task.save();
  res.status(200).json(task);
});

// const updateTaskStatus = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { status } = req.body;
//   const task = await Task.findByPk(id);
//   const now = new Date();

//   if (!task) {
//     res.status(404);
//     throw new Error('Task not found');
//   }
//   if (!req.user.is_master && task.EmployeeId !== req.user.id) {
//     res.status(403);
//     throw new Error('User not authorized to update this task');
//   }

//   switch (status) {
//     case 'start':
//       if (task.status === 'pending') {
//         task.status = 'in_progress';
//         task.actual_start_time = now;
//         task.last_resume_time = now;
//       }
//       break;
//     case 'pause':
//       if (task.status === 'in_progress') {
//         const elapsed = (now - new Date(task.last_resume_time)) / 1000;
//         task.accumulated_duration_seconds += elapsed;
//         task.status = 'paused';
//       }
//       break;
//     case 'resume':
//       if (task.status === 'paused') {
//         task.status = 'in_progress';
//         task.last_resume_time = now;
//       }
//       break;
//     case 'complete':
//       if (task.status === 'in_progress' || task.status === 'paused') {
//         if (task.status === 'in_progress') {
//           const elapsed = (now - new Date(task.last_resume_time)) / 1000;
//           task.accumulated_duration_seconds += elapsed;
//         }
//         task.status = 'completed';
//         task.actual_end_time = now;
//       }
//       break;
//     default:
//       res.status(400);
//       throw new Error('Invalid status transition');
//   }

//   await task.save();
//   res.status(200).json(task);
// });



const updateTaskStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, duration_minutes } = req.body;
  const task = await Task.findByPk(id);
  const now = new Date();

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  if (!req.user.is_master && task.EmployeeId !== req.user.id) {
    res.status(403);
    throw new Error('User not authorized to update this task');
  }

  switch (status) {
    case 'set_duration':
      task.assigned_duration_minutes = duration_minutes;
      break;

    case 'start':
      if (task.status === 'pending' && task.assigned_duration_minutes) {
        task.status = 'in_progress';
        task.actual_start_time = task.actual_start_time || now;
        task.last_resume_time = now;
      } else {
        res.status(400);
        throw new Error('Task cannot be started');
      }
      break;

    case 'pause':
      if (task.status === 'in_progress') {
        const elapsed = (now - new Date(task.last_resume_time)) / 1000;
        task.accumulated_duration_seconds += elapsed;
        task.status = 'paused';
        task.last_resume_time = null;
      }
      break;

    case 'resume':
      if (task.status === 'paused') {
        task.status = 'in_progress';
        task.last_resume_time = now;
      }
      break;

    case 'complete':
      if (task.status === 'in_progress' || task.status === 'paused') {
        // Add final elapsed if in progress
        if (task.status === 'in_progress' && task.last_resume_time) {
          const elapsed = (now - new Date(task.last_resume_time)) / 1000;
          task.accumulated_duration_seconds += elapsed;
        }

        task.status = 'completed';
        task.actual_end_time = now;
        task.last_resume_time = null;

        // ⭐ rating logic
        if (task.assigned_duration_minutes) {
          const totalMinutes = task.accumulated_duration_seconds / 60;
          const ratio = totalMinutes / task.assigned_duration_minutes;

          if (ratio < 0.8) {
            task.completion_rating = 5;
          } else if (ratio >= 0.8 && ratio < 0.9) {
            task.completion_rating = 4;
          } else if (ratio >= 0.9 && ratio <= 1.0) {
            task.completion_rating = 3;
          } else if (ratio > 1.0 && ratio <= 1.1) {
            task.completion_rating = 2;
          } else {
            task.completion_rating = 1;
          }
        }
      }
      break;

    default:
      res.status(400);
      throw new Error('Invalid status transition');
  }

  await task.save();
  res.status(200).json(task);
});


const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await Task.findByPk(id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  if (!req.user.is_master && task.EmployeeId !== req.user.id) {
    res.status(403);
    throw new Error('User not authorized to delete this task');
  }

  await task.destroy();
  res.status(200).json({ message: 'Task deleted successfully' });
});

export {
  createTask,
  getTaskById,
  getTaskHistories,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getAvailableTasks,
  getMyActiveTasks
};