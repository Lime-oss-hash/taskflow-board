/**
 * ============================================================================
 * MANAGE BOARDS PAGE
 * ============================================================================
 * 
 * This page provides a comprehensive interface for users to manage their boards.
 * 
 * KEY FEATURES:
 * - View all boards in a List (Table) or Grid format
 * - Search/Filter boards by title
 * - Bulk selection and deletion capabilities
 * - Detailed board statistics (task counts, column structure)
 * 
 * USAGE:
 * - Accessed via /dashboard/manage
 * - Used for cleanup and organization of workspaces
 */

"use client";

import Navbar from "@/components/navbar";
import { useBoards } from "@/lib/hooks/useBoards";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Search, 
  Trash2, 
  CheckSquare, 
  Square, 
  Calendar, 
  Activity,
  Layers,
  AlertTriangle,
  LayoutGrid,
  List
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function ManageBoardsPage() {
  // --- DATA FETCHING ---
  // Fetch all boards and delete function from our custom hook
  const { boards, loading, bulkDeleteBoards } = useBoards();
  
  // --- LOCAL STATE ---
  const [searchQuery, setSearchQuery] = useState(""); // For filtering boards
  const [selectedIds, setSelectedIds] = useState<string[]>([]); // Track selected board IDs for bulk actions
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Control delete confirmation modal
  const [isDeleting, setIsDeleting] = useState(false); // Loading state during deletion
  const [viewMode, setViewMode] = useState<"list" | "grid">("list"); // Toggle between List and Grid views
  
  // --- DERIVED STATE ---
  // Filter boards based on the search query (case-insensitive)
  const filteredBoards = boards.filter(board => 
    board.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- HANDLERS ---

  /**
   * Toggle selection of ALL filtered boards.
   * If all are currently selected, deselect all.
   * Otherwise, select all visible boards.
   */
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredBoards.length && filteredBoards.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBoards.map(b => b.id));
    }
  };

  /**
   * Toggle selection of a SINGLE board.
   * @param id - The ID of the board to toggle
   */
  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  /**
   * Execute the bulk delete operation.
   * Calls the backend service to remove boards and clears selection on success.
   */
  const handleDeleteSelected = async () => {
    setIsDeleting(true);
    try {
      await bulkDeleteBoards(selectedIds);
      setSelectedIds([]);
      setIsDeleteModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Setup deletion for a single board (via the trash icon).
   * Sets the selection to just that one board and opens the modal.
   */
  const handleDeleteSingle = async (id: string) => {
    setSelectedIds([id]);
    setIsDeleteModalOpen(true);
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* --- PAGE HEADER --- */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Boards</h1>
              <p className="text-gray-500 dark:text-gray-400">Organize and clean up your workspace</p>
            </div>
          </div>

          {/* --- TOOLBAR (View Toggle, Delete Action, Search) --- */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* View Toggle Buttons */}
            <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={() => setViewMode("list")}
                title="List View"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={() => setViewMode("grid")}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>

            {/* Bulk Delete Button (Only visible when items selected) */}
            {selectedIds.length > 0 && (
              <Button 
                variant="destructive" 
                onClick={() => setIsDeleteModalOpen(true)}
                className="animate-in fade-in zoom-in duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedIds.length})
              </Button>
            )}
            
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search boards..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white dark:bg-gray-800"
              />
            </div>
          </div>
        </div>

        {/* --- EMPTY STATE --- */}
        {filteredBoards.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Layers className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No boards found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              {searchQuery ? "Try adjusting your search query." : "You haven't created any boards yet."}
            </p>
            {!searchQuery && (
               <Link href="/dashboard">
                 <Button className="mt-6">Create your first board</Button>
               </Link>
            )}
          </div>
        )}

        {/* --- VIEW: LIST (TABLE) --- */}
        {viewMode === "list" && (
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {filteredBoards.length > 0 && (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    {/* Checkbox Header */}
                    <th className="px-6 py-4 text-left w-12">
                      <div 
                        className="flex items-center cursor-pointer"
                        onClick={toggleSelectAll}
                      >
                        {selectedIds.length === filteredBoards.length && filteredBoards.length > 0 ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Board Title</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Structure</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Count</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredBoards.map((board) => (
                    <tr 
                      key={board.id} 
                      className={`
                        group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors
                        ${selectedIds.includes(board.id) ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                      `}
                    >
                      {/* Checkbox Cell */}
                      <td className="px-6 py-4">
                        <div 
                          className="cursor-pointer"
                          onClick={() => toggleSelect(board.id)}
                        >
                          {selectedIds.includes(board.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                          )}
                        </div>
                      </td>
                      {/* Board Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${board.color || 'bg-blue-500'}`}></div>
                          <span className="font-medium text-gray-900 dark:text-white">{board.title}</span>
                        </div>
                      </td>
                      {/* Structure (Columns) */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2 max-w-xs">
                          {board.columnCounts?.map((col) => (
                            <div 
                              key={col.id} 
                              className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs"
                              title={`${col.title}: ${col.count} tasks`}
                            >
                              <span className="text-gray-600 dark:text-gray-400 mr-1.5 max-w-[80px] truncate">{col.title}</span>
                              <span className={`font-medium ${col.count > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                                {col.count}
                              </span>
                            </div>
                          ))}
                          {(!board.columnCounts || board.columnCounts.length === 0) && (
                             <span className="text-xs text-gray-400 italic">No lists</span>
                          )}
                        </div>
                      </td>
                      {/* Stats */}
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {board.taskCount || 0} tasks
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(board.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(board.updated_at || board.created_at).toLocaleDateString()}
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleDeleteSingle(board.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* --- VIEW: GRID (CARDS) --- */}
        {/* Visible on mobile by default, or when grid mode is selected on desktop */}
        <div className={`${viewMode === "list" ? "md:hidden" : ""} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`}>
          {filteredBoards.map((board) => (
            <Card 
              key={board.id}
              className={`
                hover:shadow-md transition-all duration-200
                ${selectedIds.includes(board.id) ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/30 dark:bg-blue-900/10" : ""}
              `}
            >
              <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                <div className="flex items-center gap-3 w-full">
                  {/* Selection Checkbox */}
                  <div 
                    onClick={() => toggleSelect(board.id)}
                    className="cursor-pointer hover:scale-110 transition-transform"
                  >
                    {selectedIds.includes(board.id) ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold flex items-center gap-2 truncate">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${board.color || 'bg-blue-500'}`}></div>
                      <span className="truncate">{board.title}</span>
                    </CardTitle>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 -mr-2 -mt-2"
                  onClick={() => handleDeleteSingle(board.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>{board.taskCount || 0} tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(board.updated_at || board.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {/* Lists Summary (First 3 lists) */}
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="space-y-1.5">
                    {board.columnCounts?.slice(0, 3).map((col) => (
                      <div key={col.id} className="flex justify-between items-center text-xs">
                         <span className="text-gray-600 dark:text-gray-400 truncate max-w-[120px]">{col.title}</span>
                         <span className={`font-medium ${col.count > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                           {col.count}
                         </span>
                      </div>
                    ))}
                    {/* Overflow indicator */}
                    {(board.columnCounts?.length || 0) > 3 && (
                       <div className="text-xs text-gray-400 pl-1 pt-1">
                         + {(board.columnCounts?.length || 0) - 3} more lists
                       </div>
                    )}
                    {(!board.columnCounts || board.columnCounts.length === 0) && (
                       <div className="text-xs text-gray-400 italic">No lists created</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* --- DELETE CONFIRMATION DIALOG --- */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete {selectedIds.length > 1 ? `${selectedIds.length} Boards` : "Board"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIds.length > 1 ? "these boards" : "this board"}? 
              This action cannot be undone and will permanently delete all associated lists and tasks.
            </DialogDescription>
          </DialogHeader>
          
          {/* List of boards to be deleted */}
          {selectedIds.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3 max-h-40 overflow-y-auto text-sm">
              <ul className="space-y-1">
                {boards
                  .filter(b => selectedIds.includes(b.id))
                  .map(b => (
                    <li key={b.id} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <div className={`w-2 h-2 rounded-full ${b.color || 'bg-blue-500'}`}></div>
                      <span className="truncate">{b.title}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSelected} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Forever"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}