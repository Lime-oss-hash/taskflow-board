import { describe, it, expect, vi } from "vitest";
import { boardService, boardDataService } from "@/lib/services";

// Create a chainable mock
function createMockSupabase() {
  const chainable: Record<string, unknown> = {};

  const methods = [
    "from",
    "select",
    "insert",
    "update",
    "delete",
    "eq",
    "order",
    "single",
    "in",
  ];
  methods.forEach((method) => {
    chainable[method] = vi.fn(() => chainable);
  });

  return chainable;
}

describe("boardService", () => {
  describe("getBoard", () => {
    it("fetches a single board by ID", async () => {
      const mockBoard = {
        id: "board-1",
        title: "Test Board",
        description: "Test description",
        color: "blue",
        user_id: "user-1",
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      };

      const supabase = createMockSupabase() as Record<
        string,
        ReturnType<typeof vi.fn>
      >;
      supabase.single.mockResolvedValueOnce({ data: mockBoard, error: null });

      const result = await boardService.getBoard(
        supabase as unknown as Parameters<typeof boardService.getBoard>[0],
        "board-1"
      );

      expect(supabase.from).toHaveBeenCalledWith("boards");
      expect(supabase.eq).toHaveBeenCalledWith("id", "board-1");
      expect(result).toEqual(mockBoard);
    });

    it("throws error when board not found", async () => {
      const supabase = createMockSupabase() as Record<
        string,
        ReturnType<typeof vi.fn>
      >;
      supabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Board not found" },
      });

      await expect(
        boardService.getBoard(
          supabase as unknown as Parameters<typeof boardService.getBoard>[0],
          "non-existent"
        )
      ).rejects.toThrow();
    });
  });

  describe("getBoards", () => {
    it("fetches all boards for a user", async () => {
      const mockBoards = [
        {
          id: "board-1",
          title: "Board 1",
          description: null,
          color: "blue",
          user_id: "user-1",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
        {
          id: "board-2",
          title: "Board 2",
          description: "Description",
          color: "green",
          user_id: "user-1",
          created_at: "2025-01-02T00:00:00Z",
          updated_at: "2025-01-02T00:00:00Z",
        },
      ];

      const supabase = createMockSupabase() as Record<
        string,
        ReturnType<typeof vi.fn>
      >;
      supabase.order.mockResolvedValueOnce({ data: mockBoards, error: null });

      const result = await boardService.getBoards(
        supabase as unknown as Parameters<typeof boardService.getBoards>[0],
        "user-1"
      );

      expect(supabase.from).toHaveBeenCalledWith("boards");
      expect(supabase.eq).toHaveBeenCalledWith("user_id", "user-1");
      expect(result).toHaveLength(2);
    });

    it("returns empty array when no boards exist", async () => {
      const supabase = createMockSupabase() as Record<
        string,
        ReturnType<typeof vi.fn>
      >;
      supabase.order.mockResolvedValueOnce({ data: [], error: null });

      const result = await boardService.getBoards(
        supabase as unknown as Parameters<typeof boardService.getBoards>[0],
        "user-1"
      );

      expect(result).toEqual([]);
    });
  });

  describe("createBoard", () => {
    it("creates a new board", async () => {
      const newBoard = {
        title: "New Board",
        description: "New board description",
        color: "purple",
        user_id: "user-1",
      };

      const createdBoard = {
        id: "board-new",
        ...newBoard,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      };

      const supabase = createMockSupabase() as Record<
        string,
        ReturnType<typeof vi.fn>
      >;
      supabase.single.mockResolvedValueOnce({
        data: createdBoard,
        error: null,
      });

      const result = await boardService.createBoard(
        supabase as unknown as Parameters<typeof boardService.createBoard>[0],
        newBoard
      );

      expect(supabase.from).toHaveBeenCalledWith("boards");
      expect(supabase.insert).toHaveBeenCalledWith(newBoard);
      expect(result).toEqual(createdBoard);
    });

    it("throws error on creation failure", async () => {
      const supabase = createMockSupabase() as Record<
        string,
        ReturnType<typeof vi.fn>
      >;
      supabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Creation failed" },
      });

      await expect(
        boardService.createBoard(
          supabase as unknown as Parameters<typeof boardService.createBoard>[0],
          { title: "Test", user_id: "user-1", color: "blue", description: null }
        )
      ).rejects.toThrow();
    });
  });

  describe("updateBoard", () => {
    it("updates an existing board", async () => {
      const updates = {
        title: "Updated Title",
        description: "Updated description",
      };

      const updatedBoard = {
        id: "board-1",
        title: "Updated Title",
        description: "Updated description",
        color: "blue",
        user_id: "user-1",
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-02T00:00:00Z",
      };

      const supabase = createMockSupabase() as Record<
        string,
        ReturnType<typeof vi.fn>
      >;
      supabase.single.mockResolvedValueOnce({
        data: updatedBoard,
        error: null,
      });

      const result = await boardService.updateBoard(
        supabase as unknown as Parameters<typeof boardService.updateBoard>[0],
        "board-1",
        updates
      );

      expect(supabase.from).toHaveBeenCalledWith("boards");
      expect(supabase.update).toHaveBeenCalled();
      expect(supabase.eq).toHaveBeenCalledWith("id", "board-1");
      expect(result.title).toBe("Updated Title");
    });
  });

  describe("deleteBoard", () => {
    it("deletes a board and related data", async () => {
      const supabase = createMockSupabase() as Record<
        string,
        ReturnType<typeof vi.fn>
      >;

      // Mock cascading deletes
      supabase.eq.mockResolvedValue({ error: null });

      await boardService.deleteBoard(
        supabase as unknown as Parameters<typeof boardService.deleteBoard>[0],
        "board-1"
      );

      expect(supabase.from).toHaveBeenCalledWith("boards");
      expect(supabase.delete).toHaveBeenCalled();
      expect(supabase.eq).toHaveBeenCalledWith("id", "board-1");
    });
  });

  describe("bulkDeleteBoards", () => {
    it("deletes multiple boards", async () => {
      const supabase = createMockSupabase() as Record<
        string,
        ReturnType<typeof vi.fn>
      >;
      supabase.in.mockResolvedValue({ error: null });

      await boardService.bulkDeleteBoards(
        supabase as unknown as Parameters<
          typeof boardService.bulkDeleteBoards
        >[0],
        ["board-1", "board-2", "board-3"]
      );

      expect(supabase.from).toHaveBeenCalled();
      expect(supabase.delete).toHaveBeenCalled();
    });

    it("handles empty array gracefully", async () => {
      const supabase = createMockSupabase() as Record<
        string,
        ReturnType<typeof vi.fn>
      >;

      // Should not throw for empty array
      await expect(
        boardService.bulkDeleteBoards(
          supabase as unknown as Parameters<
            typeof boardService.bulkDeleteBoards
          >[0],
          []
        )
      ).resolves.not.toThrow();
    });
  });
});

describe("boardDataService", () => {
  describe("getBoardWithColumns", () => {
    it("fetches board with its columns", async () => {
      const mockBoard = {
        id: "board-1",
        title: "Test Board",
        description: "Test",
        color: "blue",
        user_id: "user-1",
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      };

      const mockColumns = [
        {
          id: "col-1",
          title: "To Do",
          sort_order: 0,
          board_id: "board-1",
          created_at: "2025-01-01T00:00:00Z",
          user_id: "user-1",
        },
        {
          id: "col-2",
          title: "Done",
          sort_order: 1,
          board_id: "board-1",
          created_at: "2025-01-01T00:00:00Z",
          user_id: "user-1",
        },
      ];

      const supabase = createMockSupabase() as Record<
        string,
        ReturnType<typeof vi.fn>
      >;

      // getBoardWithColumns calls three services in sequence:
      // 1. boardService.getBoard -> from("boards").select("*").eq().single()
      // 2. columnService.getColumns -> from("columns").select("*").eq().order()
      // 3. taskService.getTasksByBoard -> from("tasks").select().eq().order()

      // Mock single() for getBoard
      supabase.single.mockResolvedValueOnce({ data: mockBoard, error: null });
      // Mock order() for getColumns
      supabase.order.mockResolvedValueOnce({ data: mockColumns, error: null });
      // Mock order() for getTasksByBoard (returns empty tasks)
      supabase.order.mockResolvedValueOnce({ data: [], error: null });

      const result = await boardDataService.getBoardWithColumns(
        supabase as unknown as Parameters<
          typeof boardDataService.getBoardWithColumns
        >[0],
        "board-1"
      );

      expect(supabase.from).toHaveBeenCalledWith("boards");
      expect(result.columnsWithTasks).toHaveLength(2);
    });
  });

  describe("createBoardWithDefaultColumns", () => {
    it("creates a board with default columns", async () => {
      const supabase = createMockSupabase() as Record<
        string,
        ReturnType<typeof vi.fn>
      >;

      const createdBoard = {
        id: "board-new",
        title: "New Board",
        description: null,
        color: "bg-blue-500",
        user_id: "user-1",
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      };

      const createdColumn = {
        id: "col-new",
        title: "To Do",
        sort_order: 0,
        board_id: "board-new",
        user_id: "user-1",
        created_at: "2025-01-01T00:00:00Z",
      };

      // First single() call is for createBoard
      supabase.single.mockResolvedValueOnce({
        data: createdBoard,
        error: null,
      });
      // Following 4 single() calls are for creating default columns
      supabase.single.mockResolvedValue({
        data: createdColumn,
        error: null,
      });

      const result = await boardDataService.createBoardWithDefaultColumns(
        supabase as unknown as Parameters<
          typeof boardDataService.createBoardWithDefaultColumns
        >[0],
        {
          title: "New Board",
          userId: "user-1",
        }
      );

      expect(result.title).toBe("New Board");
      // Board + 4 columns = 5 inserts total
      expect(supabase.insert).toHaveBeenCalledTimes(5);
    });
  });
});
