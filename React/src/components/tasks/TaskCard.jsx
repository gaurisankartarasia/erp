import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Edit,
  Play,
  Pause,
  Check,
  Clock,
  History,
  RotateCw,
  Timer,
} from "lucide-react";
import apiClient from "../../api/axiosConfig";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { useNavigate } from "react-router-dom";
import { useConfirmModal } from "@/hooks/useConfirmModal";
import { useMessageModal } from "@/hooks/useMessageModal";

const TaskCard = ({ task, onTaskUpdate }) => {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const navigate = useNavigate();
  const confirm = useConfirmModal();
  const showMessage = useMessageModal();

  useEffect(() => {
    if (
      task.status !== "in_progress" ||
      !task.assigned_duration_minutes ||
      !task.last_resume_time
    ) {
      setTimeLeft(null);
      return;
    }
    const updateTimeLeft = () => {
      const now = new Date();
      const resumeTime = new Date(task.last_resume_time);
      const elapsedSinceResume = Math.floor((now - resumeTime) / 1000);
      const totalElapsed =
        task.accumulated_duration_seconds + elapsedSinceResume;
      const totalAssignedSeconds = task.assigned_duration_minutes * 60;
      setTimeLeft(totalAssignedSeconds - totalElapsed);
    };
    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [
    task.status,
    task.assigned_duration_minutes,
    task.last_resume_time,
    task.accumulated_duration_seconds,
  ]);

  const handleStatusUpdate = async (status) => {
    setIsActionLoading(true);
    try {
      const response = await apiClient.patch(`/tasks/${task.id}/status`, {
        status,
      });
      onTaskUpdate(response.data);
      showMessage({
        message: `Task ${status} successfully.`,
        variant: "success",
      });
    } catch (err) {
      showMessage({
        message: err.response?.data?.message || "Failed to update task.",
        variant: "error",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    if (minutes === null || minutes === undefined) return "N/A";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const formatTimeLeft = (seconds) => {
    if (seconds === null || seconds === undefined) return null;
    const isOvertime = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const hours = Math.floor(absSeconds / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    const secs = absSeconds % 60;
    const timeString =
      hours > 0 ? `${hours}h ${minutes}m ${secs}s` : `${minutes}m ${secs}s`;
    return { timeString, isOvertime };
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        variant: "outline",
        label: "Pending",
        icon: <History className="mr-1 h-3 w-3" />,
      },
      in_progress: {
        variant: "default",
        label: "In Progress",
        icon: <Clock className="mr-1 h-3 w-3" />,
        className: "bg-primary animate-pulse",
      },
      paused: {
        variant: "secondary",
        label: "Paused",
        icon: <Pause className="mr-1 h-3 w-3" />,
      },
    };
    const config = statusConfig[status] || {
      variant: "outline",
      label: status,
      icon: null,
    };
    return (
      <Badge variant={config.variant} className={cn(config.className)}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const renderTimeLeft = () => {
    if (task.status !== "in_progress" || timeLeft === null) return null;
    const timeInfo = formatTimeLeft(timeLeft);
    if (!timeInfo) return null;
    return (
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-md border",
          timeInfo.isOvertime
            ? "bg-red-50 border-red-200 text-red-700"
            : timeLeft <= 300
            ? "bg-amber-50 border-amber-200 text-amber-700"
            : "bg-blue-50 border-blue-200 text-blue-700"
        )}
      >
        <Timer className="h-4 w-4" />
        <span className="text-sm font-medium"  title={timeInfo.isOvertime ? "Overtime" : "Time Left"} >
          
          {timeInfo.timeString}
        </span>
      </div>
    );
  };

  const renderActions = () => {
    if (isActionLoading)
      return (
        <div className="w-full flex justify-center">
          <Spinner />
        </div>
      );
    switch (task.status) {
      case "pending":
        return (
          <Button
            onClick={() => handleStatusUpdate("start")}
            className="w-full"
          >
            <Play className="mr-2 h-4 w-4" /> Start
          </Button>
        );
      case "in_progress":
        return (
          <div className="w-full flex items-center gap-2">
            {renderTimeLeft()}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleStatusUpdate("pause")}
                variant="secondary"
              >
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
              <Button
                onClick={async () => {
                  const confirmed = await confirm({
                    title: "Complete Task",
                    description:
                      "Are you sure you want to mark this task as complete?",
                  });
                  if (confirmed) {
                    handleStatusUpdate("complete");
                  }
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" />
                Complete
              </Button>
            </div>
          </div>
        );
      case "paused":
        return (
          <Button
            onClick={() => handleStatusUpdate("resume")}
            title="Resume Task"
          >
            <RotateCw className=" h-4 w-4" />
            Resume
          </Button>
        );
      default:
        return null;
    }
  };

  return (
 <Card >
  <CardContent className={"flex items-center justify-between px-3"} >
  {/* Title */}
  <CardTitle className="text-base font-semibold whitespace-nowrap">
   {task.title}
  </CardTitle>

  {/* Duration */}
  <p className="text-sm text-muted-foreground whitespace-nowrap">
    Est. Duration:{" "}
    <span className="font-bold text-foreground">
      {formatDuration(task.assigned_duration_minutes)}
    </span>
  </p>

  {/* Description */}
  <CardDescription className="text-sm truncate max-w-xs">
    {task.description}
  </CardDescription>

  {/* Status + Edit */}
  <div className="flex items-center gap-2">
    {task.status === "pending" && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => navigate(`/tasks/edit/${task.id}`)}
              variant="ghost"
              size="icon"
              className="h-7 w-7"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit Task</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
    {getStatusBadge(task.status)}
  </div>

  {/* Actions */}
  <div className="flex items-center gap-2">
    {renderActions()}
  </div>
  </CardContent>
</Card>

  );
};

export default TaskCard;
