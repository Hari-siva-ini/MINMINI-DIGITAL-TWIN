/**
 * MINMINI SQLite-Compatible Persistent Memory Dashboard
 * Provides structured query, natural language search, importance classification,
 * backup/export, and CRUD capabilities for long-term personal care facts.
 */
import React, { useState } from 'react';
import {
  Database,
  Download,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { MemoryCategory, MemoryImportance, MemoryRecord } from '../../types/minmini';
import { MemoryManager } from '../../services/memoryManager';

export const MemoryTab: React.FC = () => {
  const memoryMgr = MemoryManager.getInstance();
  const [memories, setMemories] = useState<MemoryRecord[]>(() => memoryMgr.getMemories());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('fact');
  const [newImportance, setNewImportance] = useState<MemoryImportance>('medium');
  const [showAddModal, setShowAddModal] = useState(false);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Categories' },
    { id: 'schedule', label: 'Schedule & Exam' },
    { id: 'preference', label: 'User Preference' },
    { id: 'fact', label: 'Personal Fact' },
    { id: 'reminder', label: 'Reminders' },
    { id: 'profile', label: 'Profile' },
    { id: 'system', label: 'System' },
  ];

  const filteredMemories = memories.filter((item) => {
    const matchCat = selectedCategory === 'all' ? true : item.category === selectedCategory;
    const matchQuery = searchQuery
      ? item.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchCat && matchQuery;
  });

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    memoryMgr.addMemory(newContent.trim(), newCategory, newImportance, 'user_chat');
    setMemories(memoryMgr.getMemories());
    setNewContent('');
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this record from MINMINI SQLite memory?')) {
      memoryMgr.deleteMemory(id);
      setMemories(memoryMgr.getMemories());
    }
  };

  const handleExport = () => {
    const jsonStr = memoryMgr.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minmini_sqlite_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetDemo = () => {
    if (confirm('Reset SQLite tables to academic demonstration default memories?')) {
      memoryMgr.resetToDefaults();
      setMemories(memoryMgr.getMemories());
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-slate-900/70 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 shadow-md">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              SQLite Persistent Memory Architecture (Section 25)
            </h2>
            <p className="text-xs text-slate-400">
              Preserves user-specific facts, schedule dates, Tamil preferences, and interaction history across sessions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-add-memory"
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Store Fact</span>
          </button>

          <button
            id="btn-export-memory"
            onClick={handleExport}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Download SQLite DB JSON Backup"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup</span>
          </button>

          <button
            id="btn-reset-demo-memory"
            onClick={handleResetDemo}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 transition-colors"
            title="Restore Academic Demo Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search memories (e.g., 'Networks exam', 'Tamil', 'Raspberry Pi')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-purple-950 text-purple-300 border border-purple-800'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Memories Table Card */}
      <div className="bg-slate-900/70 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-semibold font-mono">
              <tr>
                <th className="py-3 px-4">Memory ID & Category</th>
                <th className="py-3 px-4">Extracted Fact / Content</th>
                <th className="py-3 px-4">Importance</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredMemories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No memories found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredMemories.map((mem) => (
                  <tr key={mem.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-slate-400 text-[11px]">{mem.id}</div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-slate-800 text-sky-400 border border-slate-700 inline-block mt-1">
                        {mem.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-100 max-w-md">
                      {mem.content}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                          mem.importance === 'critical'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : mem.importance === 'high'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {mem.importance}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {mem.source}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(mem.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(mem.id)}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete memory"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for adding memory */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-slate-100">
              Store New Fact in SQLite Memory
            </h3>

            <form onSubmit={handleAddMemory} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Memory Content:
                </label>
                <textarea
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="e.g., User prefers drinking warm tea during study breaks."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Category:
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                  >
                    <option value="fact">Personal Fact</option>
                    <option value="schedule">Schedule & Exam</option>
                    <option value="preference">User Preference</option>
                    <option value="reminder">Reminder</option>
                    <option value="profile">Profile</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Importance:
                  </label>
                  <select
                    value={newImportance}
                    onChange={(e) => setNewImportance(e.target.value as MemoryImportance)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-md"
                >
                  Store Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
