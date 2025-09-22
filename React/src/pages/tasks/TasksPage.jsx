import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Terminal } from "lucide-react";
import apiClient from "@/api/axiosConfig";
import TaskCard from "@/components/tasks/TaskCard";
import { Spinner } from "@/components/ui/spinner";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pageSize: 9, totalPages: 1 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get("/tasks/active-tasks");
        setTasks(res.data);
        setPagination(prev => ({ ...prev, totalPages: res.data.totalPages }));
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch tasks.");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [pagination.page]);

  const handleTaskUpdate = (updatedTask) => {
    if (updatedTask.status === 'completed') {
      setTasks(prevTasks => prevTasks.filter(t => t.id !== updatedTask.id));
      toast.success(`Task "${updatedTask.title}" moved to histories!`);
    } else {
      setTasks(prevTasks => prevTasks.map(t => (t.id === updatedTask.id ? updatedTask : t)));
    }
  };

  const paginationControls = (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button variant="outline" size="sm" onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page <= 1}>Previous</Button>
      <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages || 1}</span>
      <Button variant="outline" size="sm" onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page >= pagination.totalPages}>Next</Button>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">My Active Tasks</h1>
        <Button onClick={() => navigate("/tasks/add")}><Plus className="mr-2 h-4 w-4" />Create Task</Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]"><Spinner size="large" /></div>
      ) : error ? (
        <Alert variant="destructive"><Terminal className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
      ) : tasks.length !== 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            {tasks.map((task) => <TaskCard key={task.id} task={task} onTaskUpdate={handleTaskUpdate} />)}
          </div>
          {pagination.totalPages > 1 && paginationControls}
        </>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-semibold">No Active Tasks</h3>
          <p className="text-muted-foreground mt-1">Click 'Create Task' to get started.</p>
        </div>
      )}
    </div>
  );
};

export default TasksPage;