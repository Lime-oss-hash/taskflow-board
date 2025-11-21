"use client";
import { boardDataService } from "@/lib/services";
import { useUser } from "@clerk/nextjs";
import { Board, ColumnWithTasks } from "../supabase/models";
import { useEffect, useState } from "react";
import { useSupabase } from "../supabase/SupabaseProvider";
import { boardService } from "@/lib/services";

export function useBoards() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { supabase } = useSupabase();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isUserLoaded) return;

    if (!user) {
      setLoading(false);
      return;
    }

    if (user && supabase) {
      loadBoards();
    }
  }, [user, isUserLoaded, supabase]);

  async function loadBoards() {
    if (!user || !supabase) return;

    try {
      setLoading(true);
      setError(null);
      const data = await boardService.getBoards(supabase!, user.id);
      setBoards(data);
    } catch (err) {
      console.error("loadBoards error:", err);
      const errorMessage = err instanceof Error ? err.message : (typeof err === 'object' ? JSON.stringify(err) : String(err));
      setError(errorMessage || "Failed to load boards.");
    } finally {
      setLoading(false);
    }
  }

  async function createBoard(boardData: {
    title: string;
    description?: string;
    color?: string;
  }) {
    console.log("createBoard called", { user: !!user, supabase: !!supabase });
    if (!user || !supabase) {
      console.error("User or Supabase missing", { user, supabase });
      throw new Error("User not authenticated or Supabase not initialized");
    }

    try {
      const newBoard = await boardDataService.createBoardWithDefaultColumns(
        supabase!,
        {
          ...boardData,
          userId: user.id,
        }
      );
      setBoards((prev) => [newBoard, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board.");
    }
  }

  return { boards, loading, error, createBoard };
}

export function useBoard(boardId: string) {
  const { supabase } = useSupabase();
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<ColumnWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (boardId) {
      loadBoard();
    }
  }, [boardId, supabase]);

  async function loadBoard() {
    if (!boardId || !supabase) return;

    try {
      setLoading(true);
      setError(null);
      const data = await boardDataService.getBoardWithColumns(supabase!, boardId);
      setBoard(data.board);
      setColumns(data.columnsWithTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load board.");
    } finally {
      setLoading(false);
    }
  }

  async function updateBoard(boardId: string, updates: Partial<Board>) {
    try {
      const updatedBoard = await boardService.updateBoard(
        supabase!,
        boardId,
        updates
      );
      setBoard(updatedBoard);
      return updatedBoard;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update board.");
    }
  }

  async function createRealTask(
    columnId: string,
    taskData: {
      title: string;
      description?: string;
      assignee?: string;
      dueDate?: string;
      priority: "low" | "medium" | "high";
    }
  ) {
    try {
      const newTask = await boardService.createTask(supabase!, {
        title: taskData.title,
        description: taskData.description || null,
        assignee: taskData.assignee || null,
        due_date: taskData.dueDate || null,
        column_id: columnId,
        sort_order: 
          columns.find(col => col.id === columnId)?.tasks.length || 0,
        priority: taskData.priority || "medium",
      });

      setColumns((prev) => prev.map((col) => col.id === columnId ? {
        ...col,
        tasks: [...col.tasks, newTask],
      } : col
      ));

      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task.");
    }
  }

  return {
    board,
    columns,
    loading,
    error,
    updateBoard,
    createRealTask,
  };
}