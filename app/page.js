"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "todo-list-app:tasks";

/** @typedef {{ id: number, text: string, completed: boolean, dueDate: string | null, category: string, tags: string[] }} Task */

const DEFAULT_CATEGORY = "その他";

const CATEGORY_STYLES = {
  仕事: "bg-blue-100 text-blue-700",
  勉強: "bg-green-100 text-green-700",
  プライベート: "bg-purple-100 text-purple-700",
  その他: "bg-slate-100 text-slate-600",
};

const CATEGORIES = Object.keys(CATEGORY_STYLES);

// 既存データに`category`が無い場合はその他として扱う
function getTaskCategory(task) {
  return task.category || DEFAULT_CATEGORY;
}

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// dueDateは"YYYY-MM-DD"形式なので文字列のまま比較できる
function getDueDateStatus(dueDate, today) {
  if (!dueDate) return null;
  if (dueDate < today) return "overdue";
  if (dueDate === today) return "today";
  return "upcoming";
}

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [dueDateValue, setDueDateValue] = useState("");
  const [categoryValue, setCategoryValue] = useState(DEFAULT_CATEGORY);
  const [tagInputValue, setTagInputValue] = useState("");
  const [pendingTags, setPendingTags] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const today = getTodayString();

  // 初回表示時にlocalStorageから保存済みのタスクを読み込む
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        // localStorage(ブラウザAPI)からの初回読み込みのため、effect内でのsetStateが必要
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("タスクの読み込みに失敗しました", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // タスクが変化するたびにlocalStorageへ保存する（初回読み込み前は上書きしない）
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const isEditing = editingId !== null;

  const handleSubmit = () => {
    const text = inputValue.trim();
    if (!text) return;
    const dueDate = dueDateValue || null;
    if (isEditing) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingId
            ? { ...task, text, dueDate, category: categoryValue, tags: pendingTags }
            : task
        )
      );
      setEditingId(null);
    } else {
      setTasks((prev) => [
        ...prev,
        {
          id: Date.now(),
          text,
          completed: false,
          dueDate,
          category: categoryValue,
          tags: pendingTags,
        },
      ]);
    }
    setInputValue("");
    setDueDateValue("");
    setCategoryValue(DEFAULT_CATEGORY);
    setPendingTags([]);
    setTagInputValue("");
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setInputValue(task.text);
    setDueDateValue(task.dueDate || "");
    setCategoryValue(getTaskCategory(task));
    setPendingTags(task.tags || []);
    setTagInputValue("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setInputValue("");
    setDueDateValue("");
    setCategoryValue(DEFAULT_CATEGORY);
    setPendingTags([]);
    setTagInputValue("");
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const tag = tagInputValue.trim();
    if (tag && !pendingTags.includes(tag)) {
      setPendingTags((prev) => [...prev, tag]);
    }
    setTagInputValue("");
  };

  const removePendingTag = (tag) => {
    setPendingTags((prev) => prev.filter((t) => t !== tag));
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    if (id === editingId) cancelEdit();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape" && isEditing) cancelEdit();
  };

  const filteredTasks =
    activeCategory === "all"
      ? tasks
      : tasks.filter((task) => getTaskCategory(task) === activeCategory);

  const remainingCount = filteredTasks.filter((task) => !task.completed).length;

  const filterButtonClass = (active) =>
    `shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
      active
        ? "border-blue-500 bg-blue-500 text-white"
        : "border-slate-300 text-slate-600 hover:bg-slate-50"
    }`;

  return (
    <div className="flex min-h-screen items-start justify-center bg-slate-100 px-4 py-12 sm:py-20">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-slate-800">
          📝 ToDoリスト
        </h1>

        <div className="mb-3 flex flex-wrap gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isEditing ? "タスクを編集..." : "新しいタスクを入力..."}
            className="min-w-[140px] flex-1 rounded-lg border border-slate-300 px-4 py-2 text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <select
            value={categoryValue}
            onChange={(e) => setCategoryValue(e.target.value)}
            aria-label="カテゴリ"
            className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
            <span aria-hidden="true">📅</span>
            <input
              type="date"
              value={dueDateValue}
              onChange={(e) => setDueDateValue(e.target.value)}
              aria-label="期限日(任意)"
              className="text-slate-800 outline-none"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="shrink-0 whitespace-nowrap rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600 active:bg-blue-700"
          >
            {isEditing ? "保存" : "追加"}
          </button>
          {isEditing && (
            <button
              onClick={cancelEdit}
              className="shrink-0 whitespace-nowrap rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              キャンセル
            </button>
          )}
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-1.5">
          <input
            type="text"
            value={tagInputValue}
            onChange={(e) => setTagInputValue(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            placeholder="タグを入力してEnter..."
            className="min-w-[140px] flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          {pendingTags.map((tag) => (
            <span
              key={tag}
              className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removePendingTag(tag)}
                aria-label={`タグ「${tag}」を削除`}
                className="text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={filterButtonClass(activeCategory === "all")}
          >
            すべて表示 ({tasks.length})
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={filterButtonClass(activeCategory === category)}
            >
              {category} (
              {tasks.filter((task) => getTaskCategory(task) === category).length}
              )
            </button>
          ))}
        </div>

        {tasks.length === 0 ? (
          <p className="py-8 text-center text-slate-400">
            タスクはまだありません。上の欄から追加しましょう！
          </p>
        ) : filteredTasks.length === 0 ? (
          <p className="py-8 text-center text-slate-400">
            このカテゴリのタスクはありません。
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {filteredTasks.map((task) => {
              const dueDateStatus = getDueDateStatus(task.dueDate, today);
              const category = getTaskCategory(task);
              const tags = task.tags || [];
              return (
                <li
                  key={task.id}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                    task.id === editingId
                      ? "border-blue-300 bg-blue-50 ring-1 ring-blue-200"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="h-5 w-5 shrink-0 cursor-pointer accent-blue-500"
                  />
                  <div className="min-w-0 flex-1">
                    <span
                      className={`break-words ${
                        task.completed
                          ? "text-slate-400 line-through"
                          : "text-slate-800"
                      }`}
                    >
                      {task.text}
                    </span>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`whitespace-nowrap rounded px-1.5 py-0.5 text-xs font-medium ${CATEGORY_STYLES[category]}`}
                      >
                        {category}
                      </span>
                      {task.dueDate && (
                        <span
                          className={`flex items-center gap-1 whitespace-nowrap text-xs font-medium ${
                            dueDateStatus === "overdue"
                              ? "rounded bg-red-50 px-1.5 py-0.5 text-red-600"
                              : dueDateStatus === "today"
                              ? "rounded bg-orange-50 px-1.5 py-0.5 text-orange-600"
                              : "text-slate-500"
                          }`}
                        >
                          <span aria-hidden="true">📅</span>
                          <span>{task.dueDate.replaceAll("-", "/")}</span>
                          {dueDateStatus === "overdue" && <span>期限切れ</span>}
                          {dueDateStatus === "today" && <span>本日まで</span>}
                        </span>
                      )}
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="whitespace-nowrap rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => startEdit(task)}
                    aria-label="タスクを編集"
                    className="shrink-0 rounded-md px-2 py-1 text-sm text-blue-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    aria-label="タスクを削除"
                    className="shrink-0 rounded-md px-2 py-1 text-sm text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    削除
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {filteredTasks.length > 0 && (
          <p className="mt-6 text-center text-sm text-slate-500">
            残り {remainingCount} 件 / 表示中 {filteredTasks.length} 件
          </p>
        )}
      </div>
    </div>
  );
}
