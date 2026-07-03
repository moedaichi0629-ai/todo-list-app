"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "todo-list-app:tasks";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

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

  const addTask = () => {
    const text = inputValue.trim();
    if (!text) return;
    setTasks((prev) => [...prev, { id: Date.now(), text, completed: false }]);
    setInputValue("");
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
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addTask();
  };

  const remainingCount = tasks.filter((task) => !task.completed).length;

  return (
    <div className="flex min-h-screen items-start justify-center bg-slate-100 px-4 py-12 sm:py-20">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-slate-800">
          📝 ToDoリスト
        </h1>

        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="新しいタスクを入力..."
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <button
            onClick={addTask}
            className="shrink-0 whitespace-nowrap rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600 active:bg-blue-700"
          >
            追加
          </button>
        </div>

        {tasks.length === 0 ? (
          <p className="py-8 text-center text-slate-400">
            タスクはまだありません。上の欄から追加しましょう！
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 transition-colors hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="h-5 w-5 shrink-0 cursor-pointer accent-blue-500"
                />
                <span
                  className={`flex-1 break-words ${
                    task.completed
                      ? "text-slate-400 line-through"
                      : "text-slate-800"
                  }`}
                >
                  {task.text}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  aria-label="タスクを削除"
                  className="shrink-0 rounded-md px-2 py-1 text-sm text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}

        {tasks.length > 0 && (
          <p className="mt-6 text-center text-sm text-slate-500">
            残り {remainingCount} 件 / 全 {tasks.length} 件
          </p>
        )}
      </div>
    </div>
  );
}
