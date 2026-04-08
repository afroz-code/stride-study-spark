import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Check,
  Trash2,
  CalendarDays,
  Edit,
  Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const priorityColors: Record<string, string> = {
  low: "bg-success/20 text-success border-success/30",
  medium: "bg-warning/20 text-warning border-warning/30",
  high: "bg-destructive/20 text-destructive border-destructive/30",
};

export default function Planner() {
  const { data: tasks, isLoading } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredTasks = tasks?.filter((t) => {
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    return true;
  }) ?? [];

  const completedCount = tasks?.filter((t) => t.status === "completed").length ?? 0;
  const totalCount = tasks?.length ?? 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (editingTask) {
      updateTask.mutate(
        { id: editingTask.id, title, description, priority, deadline: deadline || undefined },
        {
          onSuccess: () => {
            toast({ title: "Task updated" });
            resetForm();
          },
        }
      );
    } else {
      createTask.mutate(
        { title, description, priority, deadline: deadline || undefined },
        {
          onSuccess: () => {
            toast({ title: "Task created" });
            resetForm();
          },
        }
      );
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDeadline("");
    setEditingTask(null);
    setOpen(false);
  };

  const startEdit = (task: any) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority);
    setDeadline(task.deadline || "");
    setOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Daily Planner</h1>
          <p className="text-muted-foreground text-sm mt-1">Organize your tasks and stay on track</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50">
            <DialogHeader>
              <DialogTitle className="font-display">{editingTask ? "Edit Task" : "New Task"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-secondary/50 border-border/50" />
              <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-secondary/50 border-border/50" />
              <div className="grid grid-cols-2 gap-3">
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Low</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="high">🔴 High</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="bg-secondary/50 border-border/50" />
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={!title.trim()}>
                {editingTask ? "Update Task" : "Create Task"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Daily Progress</span>
          <span className="text-sm text-muted-foreground">{completedCount}/{totalCount} tasks • {progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2.5 bg-secondary" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-32 bg-secondary/50 border-border/50 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32 bg-secondary/50 border-border/50 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <AnimatePresence>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card p-4 animate-pulse h-20" />
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="glass-card p-12 text-center text-muted-foreground">
              <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No tasks yet. Create your first task to get started!</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isOverdue = task.deadline && task.deadline < new Date().toISOString().split("T")[0] && task.status !== "completed";
              return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`glass-card-hover p-4 flex items-center gap-4 ${task.status === "completed" ? "opacity-60" : ""} ${isOverdue ? "border-destructive/40 bg-destructive/5" : ""}`}
              >
                <button
                  onClick={() => updateTask.mutate({ id: task.id, status: task.status === "completed" ? "pending" : "completed" })}
                  className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    task.status === "completed" ? "bg-success border-success" : "border-muted-foreground/40 hover:border-primary"
                  }`}
                >
                  {task.status === "completed" && <Check className="h-3.5 w-3.5 text-success-foreground" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </Badge>
                    {task.deadline && (
                      <span className="text-[10px] text-muted-foreground">{new Date(task.deadline).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(task)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:text-destructive"
                    onClick={() => deleteTask.mutate(task.id, { onSuccess: () => toast({ title: "Task deleted" }) })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
