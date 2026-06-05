function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

export default function ForumCommentPreview({ comments = [], commentCount = 0 }) {
  const list = Array.isArray(comments) ? comments : [];
  const total = commentCount ?? list.length;

  if (total === 0) {
    return (
      <p className="text-xs text-zinc-500 mt-3 m-0 italic">No comments yet</p>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 m-0 mb-2">
        Comments ({total})
      </p>
      <ul className="space-y-2 m-0 p-0 list-none">
        {list.map((comment, idx) => (
          <li key={comment.id ?? idx} className="text-sm">
            <span className="font-semibold">{comment.username}</span>
            {comment.created_at && (
              <span className="text-zinc-400 text-xs ml-2">{formatDate(comment.created_at)}</span>
            )}
            <p className="text-zinc-600 dark:text-zinc-400 mt-0.5 m-0 line-clamp-2">{comment.body}</p>
          </li>
        ))}
      </ul>
      {total > list.length && (
        <p className="text-xs text-zinc-500 mt-2 m-0">View all {total} comments →</p>
      )}
    </div>
  );
}
